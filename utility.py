import os
import shutil
import json
from datetime import datetime


def organize_files(directory):
    """
    Organises files into folders in the given directory by their file name.
    :param directory: directory containing the files that are to be organised
    :return:
    """
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


class MainProcessor:
    pass


class DictionaryWriter:
    """A utility class to write dictionaries into csv files."""
    def __init__(self):
        self.options = {
            "fext": ".csv",
            "sort": False,
            "composite_element": {
                "element": "first",
                "is_composite": False
            }
        }
        self.dict = {}
        self.first_line = ""
        self.fpath = ""
        self.fname = ""

    def write_to_file(self, indict: dict, first_line: str, path: str, name: str):
        self.dict = indict
        self.first_line = first_line
        self.fpath = path
        self.fname = name + self.options['fext']

        file_path = os.path.join(os.getcwd(), self.fpath, self.fname)
        if self.options['sort']:
            self.dict = dict(sorted(self.dict.items(), key=lambda item: item[1], reverse=True))

        with open(file_path, "w") as csv_file:
            csv_file.write(self.first_line)
            csv_file.write("\n")
            for key, value in self.dict.items():
                if self.options['composite_element']['is_composite']:
                    csv_file.write(f"{key[0]},{key[1]},{value}\n")
                elif self.options['composite_element']['is_composite'] is not True:
                    csv_file.write(f"{key},{value}\n")
                else:
                    raise NotImplemented
            csv_file.close()


class AllSequences:
    def __init__(self):
        self.filename = os.path.join(os.getcwd(), "clusters", "comments_clusters.jsonl")

        self.all_clusters = {}
        self.cluster1 = {}
        self.cluster2 = {}
        self.cluster3 = {}
        self.cluster4 = {}
        self.cluster5 = {}
        self.cluster6 = {}

        self.dict_list = [self.cluster1, self.cluster2, self.cluster3,
                          self.cluster4, self.cluster5, self.cluster6]

    def insert_sequences(self):
        with open(self.filename, 'r') as cluster_file:
            for line in cluster_file:
                comment_information = json.loads(line)
                sequence = ''.join(comment_information['sequence'])
                cluster = comment_information['cluster']

                if sequence in self.all_clusters:
                    self.all_clusters[sequence] += 1
                else:
                    self.all_clusters[sequence] = 1

                target_dict = self.dict_list[cluster]

                if sequence in target_dict:
                    target_dict[sequence] += 1
                else:
                    target_dict[sequence] = 1


class TotalOccurrences:
    def __init__(self):
        self.filename = os.path.join(os.getcwd(), "clusters", "comments_clusters.jsonl")

        self.all_clusters = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
        self.cluster1 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
        self.cluster2 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
        self.cluster3 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
        self.cluster4 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
        self.cluster5 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}
        self.cluster6 = {"Value": 0, "Testimony": 0, "Rhetorical": 0, "Policy": 0, "Fact": 0}

        self.dict_list = [self.cluster1, self.cluster2, self.cluster3,
                          self.cluster4, self.cluster5, self.cluster6]

    def count_total_occurrences(self):
        with open(self.filename, 'r') as cluster_file:
            for line in cluster_file:
                comment_information = json.loads(line)
                adu_types = comment_information['abstracted_adus']
                cluster = comment_information['cluster']
                target_dict = self.dict_list[cluster]

                for adu_type in adu_types:
                    self.all_clusters[adu_type] += 1
                    target_dict[adu_type] += 1


class ConsecutiveTypeOccurrences:
    def __init__(self):
        self.filename = os.path.join(os.getcwd(), "clusters", "comments_clusters.jsonl")

        self.all_clusters = {}
        self.cluster1 = {}
        self.cluster2 = {}
        self.cluster3 = {}
        self.cluster4 = {}
        self.cluster5 = {}
        self.cluster6 = {}

        self.dict_list = [self.cluster1, self.cluster2, self.cluster3,
                          self.cluster4, self.cluster5, self.cluster6]

    def count_consecutive_occurrences(self):
        with open(self.filename, 'r') as cluster_file:
            for line in cluster_file:
                comment_information = json.loads(line)
                sequence = comment_information['sequence']
                cluster = comment_information['cluster']
                target_dict = self.dict_list[cluster]

                for i in range(len(sequence) - 1):
                    cons_occ = "".join([sequence[i], sequence[i + 1]])
                    if cons_occ in self.all_clusters:
                        self.all_clusters[cons_occ] += 1
                    else:
                        self.all_clusters[cons_occ] = 1

                    if cons_occ in target_dict:
                        target_dict[cons_occ] += 1
                    else:
                        target_dict[cons_occ] = 1


class FirstLastCluster:
    def __init__(self):
        self.clusters_dict = {}
        self.fail_list = []

    def count_cluster_order(self, first_cluster: str, last_cluster: str):
        try:
            order_name = f"{int(first_cluster) + 1},{int(last_cluster) + 1}"
            if order_name in self.clusters_dict:
                self.clusters_dict[order_name] += 1
            else:
                self.clusters_dict[order_name] = 1
        except ValueError:
            print("Incompatible types because cluster was None, skipped.")
            self.fail_list.append((first_cluster, last_cluster))


class LastCommentsAnalyser:
    def __init__(self, os_path, step_back=1):
        self.seen_ids = set()
        self.array = []
        self.iterate_files(os_path)
        self.occurrences = {}
        self.cluster_amounts = {"c1": 0, "c2": 0, "c3": 0, "c4": 0, "c5": 0, "c6": 0}
        self.step_back = step_back

    def process_file(self, jobject):
        json_array = []

        for entry in jobject:
            if entry["id"] in self.seen_ids:
                continue
            self.seen_ids.add(entry["id"])
            if (entry["parent_id"] is not None and
                    entry["cluster_sgt"] is not None):  # everything is correct, comment entry is added
                json_array.append({"id": entry["id"],
                                   "parent_id": entry["parent_id"],
                                   "cluster_type": "C",
                                   "cluster": int(entry["cluster_sgt"]),
                                   "sequence": entry["sequence"]})
        return json_array

    def iterate_files(self, os_path):
        for dir in os.listdir(os_path):
            indir = os.path.join(os_path, dir)
            part_array = []
            for file in os.listdir(indir):
                infile = open(os.path.join(indir, file))
                json_object = [json.loads(jline) for jline in infile.read().splitlines()]
                file_array = self.process_file(json_object)
                part_array += file_array
            self.array.append(part_array)

    def analyse_comments(self):
        for thread_array in self.array:
            try:
                comment = thread_array[len(thread_array) - self.step_back]
                if len(thread_array) - self.step_back < 0:
                    raise IndexError("Conversation not long enough.")
            except IndexError as error:
                print(repr(error))
                continue
            else:
                sequence = eval(comment["sequence"])
                if len(sequence) == 1:
                    cons_occ = "".join([sequence[0], sequence[0]])
                    if cons_occ in self.occurrences:
                        self.occurrences[cons_occ] += 1
                    else:
                        self.occurrences[cons_occ] = 1
                else:
                    for i in range(len(sequence) - 1):
                        cons_occ = "".join([sequence[i], sequence[i + 1]])
                        if cons_occ in self.occurrences:
                            self.occurrences[cons_occ] += 1
                        else:
                            self.occurrences[cons_occ] = 1
                self.cluster_amounts[f"c{comment["cluster"] + 1}"] += 1



