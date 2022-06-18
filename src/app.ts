import { IGraduatePreference, IPlacement } from "./types";
import GeneticMatching from "./geneticMatching";

const graduatePreferences: IGraduatePreference[] = [
    {
        id: 1,
        placementRankings: [2, 1, 3],
    },
    {
        id: 2,
        placementRankings: [1, 2, 3],
    },
    {
        id: 3,
        placementRankings: [3],
    },
    {
        id: 4,
        placementRankings: [2, 3, 4],
    },
    {
        id: 5,
        placementRankings: [4, 3],
    },
];

const placements: IPlacement[] = [
    {
        id: 1,
        graduateRankings: [3],
        quota: 1,
    },
    {
        id: 2,
        graduateRankings: [],
        quota: 2,
    },
    {
        id: 3,
        graduateRankings: [],
        quota: 1,
    },
    {
        id: 4,
        graduateRankings: [],
        quota: 1,
    },
];


const gm = new GeneticMatching(graduatePreferences, placements);

let result = gm.run(10, 100);
console.log(result);
gm.evaluate(result.solution);