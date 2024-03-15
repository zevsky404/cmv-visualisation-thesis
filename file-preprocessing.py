import json
import os
from datetime import datetime
import shutil

# <editor-fold desc="Global Dictionaries">
seen_ids = set()

seen_sequence_overall = {}
seen_sequence_c1 = {}
seen_sequence_c2 = {}
seen_sequence_c3 = {}
seen_sequence_c4 = {}
seen_sequence_c5 = {}
seen_sequence_c6 = {}

seen_cons_occurrence_overall = {}
seen_cons_occurrence_c1 = {}
seen_cons_occurrence_c2 = {}
seen_cons_occurrence_c3 = {}
seen_cons_occurrence_c4 = {}
seen_cons_occurrence_c5 = {}
seen_cons_occurrence_c6 = {}

total_occurrences_overall = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
total_occurrences_c1 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
total_occurrences_c2 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
total_occurrences_c3 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
total_occurrences_c4 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
total_occurrences_c5 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
total_occurrences_c6 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}

first_last_order_dict = {}

same_occurrences_V = {}
same_occurrences_T = {}
same_occurrences_P = {}
same_occurrences_R = {}
same_occurrences_F = {}
# </editor-fold>


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


def count_consecutive_occurrences(preds: list, cluster: int):
    for i in range(len(preds) - 1):
        cons_occ = "".join([preds[i], preds[i + 1]])
        if cons_occ in seen_cons_occurrence_overall:
            seen_cons_occurrence_overall[cons_occ] += 1
        else:
            seen_cons_occurrence_overall[cons_occ] = 1

        dict_name = f"seen_cons_occurrence_c{cluster + 1}"
        target_dict = globals().get(dict_name, None)

        if cons_occ in target_dict:
            target_dict[cons_occ] += 1
        else:
            target_dict[cons_occ] = 1


def count_total_occurrences(comment_adus: list, cluster: int):
    dict_name = f"total_occurrences_c{cluster + 1}"
    target_dict = globals().get(dict_name, None)

    for wordgroup in comment_adus:
        new_adu = wordgroup["entity_group"]
        total_occurrences_overall[new_adu] += 1
        target_dict[new_adu] += 1


def count_first_last_cluster_order(first_cluster: str, last_cluster: str):
    try:
        order_name = f"{int(first_cluster) + 1},{int(last_cluster) + 1}"
        if order_name in first_last_order_dict:
            first_last_order_dict[order_name] += 1
        else:
            first_last_order_dict[order_name] = 1
    except ValueError:
        print("Incompatible types because cluster was None, skipped.")


def write_dict(rdict: dict, fpath: str, fname: str, first_line: str, sort: bool = False, first_is_composite: bool = False):
    filename = os.path.join(os.getcwd(), fpath, fname + ".csv")
    if sort:
        rdict = dict(sorted(rdict.items(), key=lambda item: item[1], reverse=True))

    with open(filename, "w") as csv_file:
        csv_file.write(first_line)
        csv_file.write("\n")
        for key, value in rdict.items():
            if first_is_composite:
                csv_file.write(f"{key[0]},{key[1]},{value}\n")
            else:
                csv_file.write(f"{key},{value}\n")
        csv_file.close()


def fill_person_dict(json):
    person_dict = {}
    counter = 1
    for entry in json:
        person = entry["author"]
        if person not in person_dict and entry["parent_id"] is not None:
            person_dict[person] = f"person_{counter}"
            counter += 1
        else:
            continue
    return person_dict


def count_same_occurrences(preds_dict: dict):
    adu_string = ""
    for entry in preds_dict:
        adu_string += entry["entity_group"][0]

    current_type = ""
    result = []
    for adu in adu_string:
        if not current_type or adu == current_type[-1]:
            current_type += adu
        else:
            result.append((current_type, len(current_type)))
            current_type = adu
    result.append((current_type, len(current_type)))
    return result


def insert_same_occurrences(same_letters: list):
    for entry in same_letters:
        if entry[1] > 1:
            target_dict = globals().get(f"same_occurrences_{entry[0][0]}")
            if entry[0] not in target_dict:
                target_dict[entry[0]] = 1
            else:
                target_dict[entry[0]] += 1


def process_thread(json_object, add_op=True):
    json_array = []
    thread_users = fill_person_dict(json_object)
    same_occurrence_list = []

    for entry in json_object:
        if entry["id"] in seen_ids:
            continue
        seen_ids.add(entry["id"])

        if entry["parent_id"] is None and not add_op:  # faulty parent id or op not added in this instance
            continue
        elif entry["parent_id"] is None and entry["cluster_sgt"] is not None:  # everything is correct, OP entry is added
            json_array.append({"id": entry["id"],
                               "cluster_type": "OP",
                               "cluster": int(entry["cluster_sgt"]),
                               "preds": entry["sequence"],
                               "user": "OP"})
        elif entry["parent_id"] is not None and entry["cluster_sgt"] is not None:  # everything is correct, comment entry is added
            json_array.append({"id": entry["id"],
                               "parent_id": entry["parent_id"],
                               "cluster_type": "C",
                               "cluster": int(entry["cluster_sgt"]),
                               "preds": entry["sequence"],
                               "user": thread_users[entry["author"]]})
            insert_sequence("".join(eval(entry["sequence"])), int(entry["cluster_sgt"]))
            count_consecutive_occurrences(eval(entry["sequence"]), int(entry["cluster_sgt"]))
            count_total_occurrences(eval(entry["preds"]), int(entry["cluster_sgt"]))
            same_occurrence_list = count_same_occurrences(eval(entry["preds"]))

    insert_same_occurrences(same_occurrence_list)
    count_first_last_cluster_order(str(json_object[1]["cluster_sgt"]), str(json_object[len(json_object) - 1]["cluster_sgt"]))
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

    # filename = os.path.join(os.getcwd(), "website/output",
    #                         "process_" + datetime.now().strftime("%Y-%m-%d_%H:%M") + ".json")
    #
    # with open(filename, "w") as json_file:
    #     json_file.write(json.dumps(big_array))
    #     json_file.close()

    write_dict(total_occurrences_overall, "website/output/occurrences/total", "total_overall", "adu_type,amount")
    write_dict(seen_sequence_overall, "website/output/sequences", f"overall", "sequence,frequency", True)
    write_dict(seen_cons_occurrence_overall, "website/output/occurrences", f"occs_overall",
               "group,variable,amount", False, True)
    write_dict(first_last_order_dict, "website/output/occurrences", "first_last_order",
               "first_cluster,last_cluster,amount")

    for i in range(1, 7):
        total_occurrences = globals().get(f"total_occurrences_c{i}", None)
        seen_sequence = globals().get(f"seen_sequence_c{i}", None)
        seen_cons_occurrences = globals().get(f"seen_cons_occurrence_c{i}")

        write_dict(total_occurrences, "website/output/occurrences/total", f"total_c{i}", "adu_type,amount")
        write_dict(seen_sequence, "website/output/sequences", f"overall_c{i}", "sequence,frequency", True)
        write_dict(seen_cons_occurrences, "website/output/occurrences", f"occs_c{i}",
                   "group,variable,amount", False, True)

    for adu_type in ["V", "T", "R", "P", "F"]:
        ext_sequence = globals().get(f"same_occurrences_{adu_type}")
        write_dict(ext_sequence, "website/output/ext_sequences", f"ext_sequences_{adu_type}",
                   "sequence,frequency", True)



