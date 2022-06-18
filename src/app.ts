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
        placementRankings: [1],
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
];


const gm = new GeneticMatching(graduatePreferences, placements);

let randomSolution = gm.generateRandomSolution();
console.log(randomSolution);

let fitness = gm.calculateFitness(randomSolution);
console.log(fitness);

gm.run(10, 10);