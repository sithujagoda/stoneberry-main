from pathlib import Path
import shutil
import random
from uuid import uuid4
from sklearn.model_selection import train_test_split

random.seed(42)

# ======================================================
# Paths
# ======================================================

BASE_DIR = Path(__file__).resolve().parent.parent

GEM_DATASET = BASE_DIR / "datasets/raw/gemstones-images-expanded/dataset-expanded"

ROCK_DATASET = BASE_DIR / "datasets/raw/rock-classifier/Rock_Classifier/data"

ROCKS_THREE = BASE_DIR / "datasets/raw/rocks-minerals/rocks_three"

OUTPUT = BASE_DIR / "datasets/processed"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
}

# ======================================================
# Create Output Folders
# ======================================================

for split in ["train", "validation", "test"]:
    (OUTPUT / split / "Gemstone").mkdir(parents=True, exist_ok=True)
    (OUTPUT / split / "NotGem").mkdir(parents=True, exist_ok=True)

# ======================================================
# Helper Functions
# ======================================================

def get_images(folder: Path):
    images = []

    for file in folder.rglob("*"):
        if file.suffix.lower() in IMAGE_EXTENSIONS:
            images.append(file)

    return images


def split_dataset(images):

    train, temp = train_test_split(
        images,
        test_size=0.20,
        random_state=42,
        shuffle=True,
    )

    validation, test = train_test_split(
        temp,
        test_size=0.50,
        random_state=42,
        shuffle=True,
    )

    return train, validation, test


def copy_images(images, destination):

    for image in images:

        unique_name = f"{uuid4().hex}{image.suffix}"

        shutil.copy2(
            image,
            destination / unique_name
        )

# ======================================================
# Collect Gemstone Images
# ======================================================

print("Collecting gemstone images...")

gem_images = []

for folder in GEM_DATASET.iterdir():
    if folder.is_dir():
        gem_images.extend(get_images(folder))

print(f"Gemstone Images : {len(gem_images)}")

# ======================================================
# Collect Rock Images
# ======================================================

print("Collecting non-gem images...")

rock_images = []

# Rock Classifier Dataset
for folder in ROCK_DATASET.iterdir():
    if folder.is_dir():
        rock_images.extend(get_images(folder))

# Rocks Three Dataset
for folder in ROCKS_THREE.iterdir():
    if folder.is_dir():
        rock_images.extend(get_images(folder))

print(f"Original NotGem Images : {len(rock_images)}")

# ======================================================
# Balance Dataset
# ======================================================

if len(rock_images) > len(gem_images):
    rock_images = random.sample(rock_images, len(gem_images))

print(f"Balanced NotGem Images : {len(rock_images)}")

# ======================================================
# Split Dataset
# ======================================================

print("Splitting datasets...")

gem_train, gem_val, gem_test = split_dataset(gem_images)

rock_train, rock_val, rock_test = split_dataset(rock_images)

# ======================================================
# Copy Images
# ======================================================

print("Copying training images...")
copy_images(gem_train, OUTPUT / "train/Gemstone")
copy_images(rock_train, OUTPUT / "train/NotGem")

print("Copying validation images...")
copy_images(gem_val, OUTPUT / "validation/Gemstone")
copy_images(rock_val, OUTPUT / "validation/NotGem")

print("Copying test images...")
copy_images(gem_test, OUTPUT / "test/Gemstone")
copy_images(rock_test, OUTPUT / "test/NotGem")

# ======================================================
# Final Statistics
# ======================================================

print("\n==============================")
print("Dataset Preparation Complete")
print("==============================")

print(f"Training Gemstone   : {len(gem_train)}")
print(f"Training NotGem     : {len(rock_train)}")

print(f"Validation Gemstone : {len(gem_val)}")
print(f"Validation NotGem   : {len(rock_val)}")

print(f"Test Gemstone       : {len(gem_test)}")
print(f"Test NotGem         : {len(rock_test)}")
