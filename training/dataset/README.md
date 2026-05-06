# Dataset Folder

Put captured training photos here before labelling/training.

Suggested structure:

```text
training/dataset/raw/sofa/
training/dataset/raw/wardrobe/
training/dataset/raw/boxes/
training/dataset/raw/tv/
```

The phone app downloads files like:

```text
training_sofa_2026-05-06T19-30-00-000Z.jpg
```

Move each file into the matching label folder.

For object detection, the final training set also needs bounding-box annotation files. Use the Colab/training notes in `training/TRAINING_PIPELINE.md`.
