import json
import math
import os
import csv


class Residuals:
    def __init__(self, outputfile):
        self.output_path = get_file_path("residuals", outputfile)
        self.counter_1 = {}
        self.counter_2 = {}
        self.counter_3 = {}
        self.counter_4 = {}
        self.counter_5 = {}
        self.counter_6 = {}
        self.counter_delta = {}
        self.counter_non_delta = {}
        self.setup_cluster_counter()

    def setup_cluster_counter(self):
        self.counter_1 = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }
        self.counter_2 = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }
        self.counter_3 = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }
        self.counter_4 = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }
        self.counter_5 = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }
        self.counter_6 = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }

        self.counter_delta = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }
        self.counter_non_delta = {
            "transitions_outgoing_total": 0,
            "transitions_incoming_total": 0,
            "transitions_to_cluster": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "0": 0,
                "-1": 0
            }
        }

    def get_counter(self, cluster):
        if cluster == 1:
            return self.counter_1
        elif cluster == 2:
            return self.counter_2
        elif cluster == 3:
            return self.counter_3
        elif cluster == 4:
            return self.counter_4
        elif cluster == 5:
            return self.counter_5
        elif cluster == 6:
            return self.counter_6
        elif cluster == 0:
            return self.counter_delta
        elif cluster == -1:
            return self.counter_non_delta

    def pretty_print_counter(self):
        print(self.counter_1)
        print(self.counter_2)
        print(self.counter_3)
        print(self.counter_4)
        print(self.counter_5)
        print(self.counter_6)
        print(self.counter_delta)
        print(self.counter_non_delta)

    def fill_counter(self, file_path, first_axis_index: int, second_axis_index: int, delta_clusters: bool = False):
        with open(file_path, "r") as file:
            reader = csv.reader(file)
            fields = next(reader)

            for row in reader:
                if not delta_clusters:
                    try:
                        first_axis_val = row[first_axis_index]
                        second_axis_val = row[second_axis_index]
                        first_axis_counter = self.get_counter(int(first_axis_val))
                        second_axis_counter = self.get_counter(int(second_axis_val))
                    except ValueError:
                        first_axis_val = math.trunc(float(row[first_axis_index]))
                        second_axis_val = math.trunc(float(row[second_axis_index]))
                        first_axis_counter = self.get_counter(first_axis_val)
                        second_axis_counter = self.get_counter(second_axis_val)
                else:
                    try:
                        first_axis_val = row[first_axis_index]
                        second_axis_val = 0 if row[second_axis_index] == "1" else -1
                        first_axis_counter = self.get_counter(int(first_axis_val))
                        second_axis_counter = self.get_counter(int(second_axis_val))
                    except ValueError:
                        first_axis_val = math.trunc(float(row[first_axis_index]))
                        second_axis_val = math.trunc(float(row[second_axis_index]))
                        first_axis_counter = self.get_counter(first_axis_val)
                        second_axis_counter = self.get_counter(second_axis_val)

                first_axis_counter["transitions_outgoing_total"] += 1
                second_axis_counter["transitions_incoming_total"] += 1
                first_axis_counter["transitions_to_cluster"][str(second_axis_val)] += 1

    def calculate_residuals(self, delta_clusters=False):
        all_residuals = []

        if not delta_clusters:
            all_second_axis_transitions = sum([
                self.counter_1["transitions_incoming_total"],
                self.counter_2["transitions_incoming_total"],
                self.counter_3["transitions_incoming_total"],
                self.counter_4["transitions_incoming_total"],
                self.counter_5["transitions_incoming_total"],
                self.counter_6["transitions_incoming_total"]
               ])

            for cluster in range(1, 7):
                residual = {
                    "for_cluster": cluster,

                    "residual_to_1": (self.get_counter(cluster)["transitions_to_cluster"]["1"] / self.get_counter(cluster)["transitions_outgoing_total"]) -
                                     (self.get_counter(cluster)["transitions_incoming_total"] / all_second_axis_transitions),

                    "residual_to_2": (self.get_counter(cluster)["transitions_to_cluster"]["2"] / self.get_counter(cluster)["transitions_outgoing_total"]) -
                                     (self.get_counter(cluster)["transitions_incoming_total"] / all_second_axis_transitions),

                    "residual_to_3": (self.get_counter(cluster)["transitions_to_cluster"]["3"] / self.get_counter(cluster)["transitions_outgoing_total"]) -
                                     (self.get_counter(cluster)["transitions_incoming_total"] / all_second_axis_transitions),

                    "residual_to_4": (self.get_counter(cluster)["transitions_to_cluster"]["4"] / self.get_counter(cluster)["transitions_outgoing_total"]) -
                                     (self.get_counter(cluster)["transitions_incoming_total"] / all_second_axis_transitions),

                    "residual_to_5": (self.get_counter(cluster)["transitions_to_cluster"]["5"] / self.get_counter(cluster)["transitions_outgoing_total"]) -
                                     (self.get_counter(cluster)["transitions_incoming_total"] / all_second_axis_transitions),

                    "residual_to_6": (self.get_counter(cluster)["transitions_to_cluster"]["6"] / self.get_counter(cluster)["transitions_outgoing_total"]) -
                                     (self.get_counter(cluster)["transitions_incoming_total"] / all_second_axis_transitions),
                }
                all_residuals.append(residual)
        else:
            delta_axis_transitions = sum([
                self.counter_delta["transitions_incoming_total"],
                self.counter_non_delta["transitions_incoming_total"]
            ])

            for cluster in range(1, 7):
                residual = {
                    "for_cluster": cluster,

                    "residual_to_delta": (self.get_counter(cluster)["transitions_to_cluster"]["0"] /
                                          self.get_counter(cluster)["transitions_outgoing_total"]) -
                                         (self.get_counter(cluster)[
                                              "transitions_incoming_total"] / delta_axis_transitions),

                    "residual_to_non_delta": (self.get_counter(cluster)["transitions_to_cluster"]["-1"] /
                                              self.get_counter(cluster)["transitions_outgoing_total"]) -
                                             (self.get_counter(cluster)[
                                                  "transitions_incoming_total"] / delta_axis_transitions)
                }
                all_residuals.append(residual)

        with open(self.output_path, "w") as jsonfile:
            json.dump(all_residuals, jsonfile)


def get_file_path(output_dir, filename):
    file_path = os.path.join(os.getcwd(), "website", "output", output_dir)
    return os.path.join(file_path, filename)


if __name__ == '__main__':
    path = get_file_path("parset_data", "run-3-pl.csv")
    axis_2_3 = Residuals("residuals_1-3-updated.json")
    axis_2_3.fill_counter(path, 1, 3, True)
    axis_2_3.calculate_residuals(True)
