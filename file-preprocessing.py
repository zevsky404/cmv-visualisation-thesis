import json
import os
from datetime import datetime
import shutil

seen_ids = set()
seen_sequence_overall = {}
seen_sequence_c1 = {}
seen_sequence_c2 = {}
seen_sequence_c3 = {}
seen_sequence_c4 = {}
seen_sequence_c5 = {}
seen_sequence_c6 = {}


def insert_sequence(sequence: str, cluster: int):
    if sequence in seen_sequence_overall:
        seen_sequence_overall[sequence] += 1
    else:
        seen_sequence_overall[sequence] = 1

    dict_name = f"seen_sequence_c{cluster + 1}"
    target_dict = globals().get(dict_name, None)

    if sequence in target_dict:
        target_dict[sequence] += 1
    else:
        target_dict[sequence] = 1


def write_sequence_csv(sequence_dict: dict, name: str):
    filename = os.path.join(os.getcwd(), "website/output/sequences", name + ".csv")
    sorted_dict = dict(sorted(sequence_dict.items(), key=lambda item: item[1], reverse=True))

    with open(filename, "w") as sequence_file:
        for sequence, frequency in sorted_dict.items():
            sequence_file.write(f"{sequence}, {frequency}")
            sequence_file.write("\n")
        sequence_file.close()


def process_thread(json_object, add_op=True):
    json_array = []

    for entry in json_object:
        if entry["id"] in seen_ids:
            continue
        seen_ids.add(entry["id"])

        if entry["parent_id"] is None and not add_op:
            continue
        elif entry["parent_id"] is None and entry["cluster_sgt"] is not None:
            json_array.append({"id": entry["id"],
                               "cluster_type": "OP",
                               "cluster": int(entry["cluster_sgt"]),
                               "preds": entry["sequence"]})
        elif entry["parent_id"] is not None and entry["cluster_sgt"] is not None:
            json_array.append({"id": entry["id"],
                               "parent_id": entry["parent_id"],
                               "cluster_type": "C",
                               "cluster": int(entry["cluster_sgt"]),
                               "preds": entry["sequence"]})
            insert_sequence("".join(eval(entry["sequence"])), int(entry["cluster_sgt"]))

    return json_array


def organize_files(directory):
    # Get a list of all files in the directory
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]

    # Create a dictionary to store files based on their names
    file_dict = {}

    # Iterate through each file in the directory
    for file in files:
        # Get the base name of the file (excluding extension)
        full_name, _ = os.path.splitext(file)
        base_name = full_name.split("_")[0]

        # If the base name is not already a key in the dictionary, create it
        if base_name not in file_dict:
            file_dict[base_name] = []

        # Add the current file to the list of files for the base name
        file_dict[base_name].append(file)

    # Create a new subdirectory to organize files
    organized_dir = os.path.join(directory, 'organized')
    os.makedirs(organized_dir, exist_ok=True)

    # Iterate through the dictionary and move files to the new subdirectory
    for base_name, files_list in file_dict.items():
        # Create a subdirectory with the base name
        subdirectory = os.path.join(organized_dir, base_name)
        os.makedirs(subdirectory, exist_ok=True)

        # Move each file to the corresponding subdirectory
        for file in files_list:
            current_path = os.path.join(directory, file)
            new_path = os.path.join(subdirectory, file)
            shutil.copyfile(current_path, new_path)


if __name__ == '__main__':
    # directories for thread json files
    dialogue_directory = os.path.join(os.getcwd(), "data", "dialogue_n")
    polylogue_directory = os.path.join(os.getcwd(), "data", "polylogue_n")
    test_directory = os.path.join(os.getcwd(), "data", "test")

    print(polylogue_directory)

    big_array = []

    for dir in os.listdir(os.path.join(polylogue_directory, "organized")):
        indir = os.path.join(polylogue_directory, "organized", dir)
        part_array = []
        for index, file in enumerate(os.listdir(indir)):
            if index == 0:
                infile = open(os.path.join(indir, file))
                json_object = [json.loads(jline) for jline in infile.read().splitlines()]
                # print(json_object)
                file_array = process_thread(json_object)
                part_array += file_array
            else:
                infile = open(os.path.join(indir, file))
                json_object = [json.loads(jline) for jline in infile.read().splitlines()]
                file_array = process_thread(json_object, False)
                part_array += file_array
        big_array.append(part_array)

    filename = os.path.join(os.getcwd(), "website/output", "process_" + datetime.now().strftime("%Y-%m-%d_%H:%M") + ".json")

    with open(filename, "w") as json_file:
        json_file.write(json.dumps(big_array))
        json_file.close()

    # write_sequence_csv(seen_sequence_overall, "overall.csv")
    # write_sequence_csv(seen_sequence_c1, "c1.csv")
    # write_sequence_csv(seen_sequence_c2, "c2.csv")
    # write_sequence_csv(seen_sequence_c3, "c3.csv")
    # write_sequence_csv(seen_sequence_c4, "c4.csv")
    # write_sequence_csv(seen_sequence_c5, "c5.csv")
    # write_sequence_csv(seen_sequence_c6, "c6.csv")


