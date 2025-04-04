import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from flask import Flask, request, jsonify
from PIL import Image
import io
import logging
from flask_cors import CORS  # Allow cross-origin requests

app = Flask(__name__)
CORS(app)  # Enable CORS

# Set up logging
logging.basicConfig(level=logging.INFO)

# Define the same model architecture
class SigNet(nn.Module):
    def __init__(self):
        super(SigNet, self).__init__()
        self.network = nn.Sequential(
            nn.Conv2d(3, 96, kernel_size=11, stride=1, padding=0, bias=False),
            nn.ReLU(),
            nn.BatchNorm2d(96),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(96, 256, kernel_size=5, stride=1, padding=2, bias=False),
            nn.ReLU(),
            nn.BatchNorm2d(256),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Dropout(p=0.3),
            nn.Conv2d(256, 384, kernel_size=3, stride=1, padding=1, bias=True),
            nn.ReLU(),
            nn.Conv2d(384, 256, kernel_size=3, stride=1, padding=1, bias=True),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Dropout(p=0.3),
            nn.Flatten(),
            nn.Linear(256 * 17 * 25, 1024),
            nn.Linear(1024, 128)
        )

    def forward(self, inp_1, inp_2):
        out_1 = self.network(inp_1)
        out_2 = self.network(inp_2)
        distance = torch.norm(out_1 - out_2, dim=1, keepdim=True)  # Use Euclidean distance
        similarity = torch.sigmoid(-distance)  # Lower distance = Higher similarity
        return similarity

# Load model weights
model = SigNet()
model.load_state_dict(torch.load("sigg_net.pth", map_location=torch.device("cpu")))
model.eval()

# Define image preprocessing
transform = transforms.Compose([
    transforms.Resize((155, 220)),  # Match training size
    transforms.ToTensor(),
])

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")  # Convert to RGB
    return transform(image).unsqueeze(0)  # Add batch dimension

@app.route("/verify", methods=["POST"])
def verify_signature():
    if "original" not in request.files or "test" not in request.files:
        return jsonify({"error": "Both original and test signature images are required"}), 400

    original_img = preprocess_image(request.files["original"].read())
    test_img = preprocess_image(request.files["test"].read())

    with torch.no_grad():
        similarity_score = model(original_img, test_img).item()

    # Multiply the similarity score by 2
    similarity_score *= 2  # Multiply the similarity score by 2

    # Adjustable threshold for verification (can be modified or passed via API parameter)
    threshold = 0.99
    match = similarity_score >= threshold  # STRICT verification threshold

    # Log the similarity score and result
    logging.info(f"Similarity Score: {similarity_score} → Match: {match}")

    if not match:
        return jsonify({"message": "❌ Signature NOT Verified", "similarity_score": similarity_score, "match": match})
    
    return jsonify({"message": "✅ Signature Verified", "similarity_score": similarity_score, "match": match})

if __name__ == "__main__":
    app.run(debug=True)
