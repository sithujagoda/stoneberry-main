from pathlib import Path
import shutil
import random
from sklearn.model_selection import train_test_split

random.seed(42)

# ==============================
# Paths
# ==============================

BASE_DIR = Path(__file__).resolve().parent.parent

GEM_DATASET = BASE_DIR / "datasets/raw/gemstones-images-expanded/dataset-expanded"

ROCK_DATASET = BASE_DIR / "datasets/raw/rock-classifier/Rock_Classifier/data"

ROCKS_THREE = BASE_DIR / "datasets/raw/rocks-minerals/rocks_three"

OUTPUT = BASE_DIR / "datasets/processed"

# ==============================
# Create Output Folders
# ==============================

for split in ["train", "validation", "test"]:
    (OUTPUT / split / "Gemstone").mkdir(parents=True, exist_ok=True)
    (OUTPUT / split / "NotGem").mkdir(parents=True, exist_ok=True)

# ==============================
# Helper Function
# ==============================

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

def get_images(folder):
    images = []
    for file in folder.rglob("*"):
        if file.suffix.lower() in IMAGE_EXTENSIONS:
            images.append(file)
    return images

# ==============================
# Collect Gemstone Images
# ==============================

gem_images = []

for gem_folder in GEM_DATASET.iterdir():
    if gem_folder.is_dir():
        gem_images.extend(get_images(gem_folder))

print(f"Gemstone Images : {len(gem_images)}")

# ==============================
# Collect Rock Images
# ==============================

rock_images = []

for folder in ROCK_DATASET.iterdir():
    if folder.is_dir():
        rock_images.extend(get_images(folder))

for folder in ROCKS_THREE.iterdir():
    if folder.is_dir():
        rock_images.extend(get_images(folder))

print(f"NotGem Images : {len(rock_images)}")

# ==============================
# Split Function
# ==============================

def split_dataset(images):

    train, temp = train_test_split(
        images,
        test_size=0.20,
        random_state=42,
        shuffle=True
    )

    validation, test = train_test_split(
        temp,
        test_size=0.50,
        random_state=42,
        shuffle=True
    )

    return train, validation, test

gem_train, gem_val, gem_test = split_dataset(gem_images)

rock_train, rock_val, rock_test = split_dataset(rock_images)

# ==============================
# Copy Function
# ==============================

def copy_images(images, destination):

    for image in images:
        shutil.copy2(
            image,
            destination / image.name
        )

print("Copying Gemstone Images...")
copy_images(gem_train, OUTPUT / "train/Gemstone")
copy_images(gem_val, OUTPUT / "validation/Gemstone")
copy_images(gem_test, OUTPUT / "test/Gemstone")

print("Copying NotGem Images...")
copy_images(rock_train, OUTPUT / "train/NotGem")
copy_images(rock_val, OUTPUT / "validation/NotGem")
copy_images(rock_test, OUTPUT / "test/NotGem")

print("\nDataset preparation completed successfully!")