import os

import utility as util

# <editor-fold desc="Global Dictionaries">
seen_ids = set()



same_occurrences_V_overall = {}
same_occurrences_T_overall = {}
same_occurrences_P_overall = {}
same_occurrences_R_overall = {}
same_occurrences_F_overall = {}

same_occurrences_V_1 = {}
same_occurrences_T_1 = {}
same_occurrences_P_1 = {}
same_occurrences_R_1 = {}
same_occurrences_F_1 = {}

same_occurrences_V_2 = {}
same_occurrences_T_2 = {}
same_occurrences_P_2 = {}
same_occurrences_R_2 = {}
same_occurrences_F_2 = {}

same_occurrences_V_3 = {}
same_occurrences_T_3 = {}
same_occurrences_P_3 = {}
same_occurrences_R_3 = {}
same_occurrences_F_3 = {}

same_occurrences_V_4 = {}
same_occurrences_T_4 = {}
same_occurrences_P_4 = {}
same_occurrences_R_4 = {}
same_occurrences_F_4 = {}

same_occurrences_V_5 = {}
same_occurrences_T_5 = {}
same_occurrences_P_5 = {}
same_occurrences_R_5 = {}
same_occurrences_F_5 = {}

same_occurrences_V_6 = {}
same_occurrences_T_6 = {}
same_occurrences_P_6 = {}
same_occurrences_R_6 = {}
same_occurrences_F_6 = {}

# </editor-fold>


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


def insert_same_occurrences(same_letters: list, cluster: int):
    for entry in same_letters:
        if entry[1] > 1:
            target_dict = globals().get(f"same_occurrences_{entry[0][0]}_{cluster + 1}")
            if entry[0] not in target_dict:
                target_dict[entry[0]] = 1
            else:
                target_dict[entry[0]] += 1


def process_thread(json_object, add_op=True):
    json_array = []
    thread_users = fill_person_dict(json_object)

    for entry in json_object:
        same_occurrence_list = []
        if entry["id"] in seen_ids:
            continue
        seen_ids.add(entry["id"])

        if entry["parent_id"] is None and not add_op:  # faulty parent id or op not added in this instance
            continue
        elif entry["parent_id"] is None and entry[
            "cluster_sgt"] is not None:  # everything is correct, OP entry is added
            json_array.append({"id": entry["id"],
                               "cluster_type": "OP",
                               "cluster": int(entry["cluster_sgt"]),
                               "preds": entry["sequence"],
                               "user": "OP"})
        elif (entry["parent_id"] is not None and
              entry["cluster_sgt"] is not None):  # everything is correct, comment entry is added
            json_array.append({"id": entry["id"],
                               "parent_id": entry["parent_id"],
                               "cluster_type": "C",
                               "cluster": int(entry["cluster_sgt"]),
                               "preds": entry["sequence"],
                               "user": thread_users[entry["author"]]})
            same_occurrence_list = count_same_occurrences(eval(entry["preds"]))
            insert_same_occurrences(same_occurrence_list, int(entry["cluster_sgt"]))
    return json_array


if __name__ == '__main__':
    test_dir = os.path.join(os.getcwd(), "data", "test")

    dl_dir = os.path.join(os.getcwd(), "data", "dialogue_n")
    pl_dir = os.path.join(os.getcwd(), "data", "polylogue_n")

    dl_nd_dir = os.path.join(os.getcwd(), "data", "dialogue_non-delta")
    pl_nd_dir = os.path.join(os.getcwd(), "data", "polylogue_non-delta")

    # organise files, if necessary
    util.organize_files(dl_nd_dir)

    # initialise a last comment analyser
    # analyser_array_pl_nd = [
    #     util.LastCommentsAnalyser(os.path.join(pl_nd_dir, "organized"), 1),
    #     util.LastCommentsAnalyser(os.path.join(pl_nd_dir, "organized"), 2),
    #     util.LastCommentsAnalyser(os.path.join(pl_nd_dir, "organized"), 3)
    # ]
    #
    # analyser_array_dl_nd = [
    #     util.LastCommentsAnalyser(os.path.join(dl_nd_dir, "organized"), 1),
    #     util.LastCommentsAnalyser(os.path.join(dl_nd_dir, "organized"), 2),
    #     util.LastCommentsAnalyser(os.path.join(dl_nd_dir, "organized"), 3)
    # ]
    #
    # analyser_array_pl = [
    #     util.LastCommentsAnalyser(os.path.join(pl_dir, "organized"), 1),
    #     util.LastCommentsAnalyser(os.path.join(pl_dir, "organized"), 2),
    #     util.LastCommentsAnalyser(os.path.join(pl_dir, "organized"), 3)
    # ]
    #
    # analyser_array_dl = [
    #     util.LastCommentsAnalyser(os.path.join(dl_dir, "organized"), 1),
    #     util.LastCommentsAnalyser(os.path.join(dl_dir, "organized"), 2),
    #     util.LastCommentsAnalyser(os.path.join(dl_dir, "organized"), 3)
    # ]

    writer = util.DictionaryWriter()
    writer.options["composite_element"]["is_composite"] = True

    # for analyser, step in zip(analyser_array_pl, range(3)):
    #     analyser.analyse_comments()
    #     writer.write_to_file(analyser.occurrences, "adu1,adu2,amount",
    #                          os.path.join(os.getcwd(), "website", "output", "last_comments", "delta"), f"{step}-pl")
    #
    # for analyser, step in zip(analyser_array_dl, range(3)):
    #     analyser.analyse_comments()
    #     writer.write_to_file(analyser.occurrences, "adu1,adu2,amount",
    #                          os.path.join(os.getcwd(), "website", "output", "last_comments", "delta"), f"{step}-dl")
    #
    # for analyser, step in zip(analyser_array_pl_nd, range(3)):
    #     analyser.analyse_comments()
    #     writer.write_to_file(analyser.occurrences, "adu1,adu2,amount",
    #                          os.path.join(os.getcwd(), "website", "output", "last_comments", "non-delta"), f"{step}-pl")
    #
    # for analyser, step in zip(analyser_array_dl_nd, range(3)):
    #     analyser.analyse_comments()
    #     writer.write_to_file(analyser.occurrences, "adu1,adu2,amount",
    #                          os.path.join(os.getcwd(), "website", "output", "last_comments", "non-delta"), f"{step}-dl")

    all_sequences = util.AllSequences()
    all_sequences.insert_sequences()

    writer.options["composite_element"]["is_composite"] = False
    writer.options["sort"] = True
    writer.write_to_file(all_sequences.all_clusters, "sequence,frequency",
                         os.path.join(os.getcwd(), "website", "output", "sequences"), "overall_non-delta")





