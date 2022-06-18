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
        graduateRankings: [4],
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
gm.setManagerWeighting(50);

console.time("run");
let result = gm.run(1000, 100);
console.timeEnd("run");

console.log(result);
gm.evaluate(result.solution);