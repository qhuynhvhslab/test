import { getAllEnableQuestsForUser, getQuestsDoneByThisUser } from "repositories/quest";
import whitelistUserMiddleware from "middlewares/whitelistUserMiddleware";
import Enums from "enums";

const unstoppableAuthQuestQueryAPI = async (req, res) => {
    const { method } = req;

    switch (method) {
        case "GET":
            try {

                const whiteListUser = req.whiteListUser;

                console.log(`** Get all enabled quests for user **`);
                let availableQuests = await getAllEnableQuestsForUser();

                console.log(`** Get quests done by this user **`);
                let finishedQuest = await getQuestsDoneByThisUser(whiteListUser.userId);

                let quests = availableQuests
                    .filter((q) => {
                        if (
                            q.type.name === Enums.UNSTOPPABLE_AUTH
                        ) {
                            return true;
                        }
                        return false;
                    })
                    .map((aq) => {
                        let relatedQuest = finishedQuest.find((q) => q.questId === aq.questId);
                        if (relatedQuest) {

                            aq.isDone = true;
                            aq.rewardedQty = relatedQuest.rewardedQty;

                        } else {
                            aq.isDone = false;
                            aq.rewardedQty = 0;
                        }
                        return aq;
                    });

                return res.status(200).json(quests);
            } catch (err) {
                console.log(err)
                res.status(500).json({ error: err.message });
            }
            break;

        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};
export default whitelistUserMiddleware(unstoppableAuthQuestQueryAPI);
