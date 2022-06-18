import { shuffle } from "./util";

class GeneticMatching {
    private graduatePreferences: IGraduatePreference[];
    private placements: IPlacement[];

    private graduateMaxRankings: number;
    private placementMaxRankings: number;

    constructor(_graduatePreferences: IGraduatePreference[], _placements: IPlacement[]) {
        this.graduatePreferences = _graduatePreferences;
        this.placements = _placements;

        this.graduateMaxRankings = 10;
        this.placementMaxRankings = 10;
    }

    // Generates a random viable solution of placement matches
    generateRandomSolution(): TMatching {
        const allPlacements: number[] = []; // Simple list of available placements e.g. [1, 2, 2, 3]
        this.placements.forEach((placement: IPlacement) => {
            for (let i = 0; i < placement.quota; i++) {
                allPlacements.push(placement.id);
            }
        });
    
        // Put placements into a random order to create a random valid solution
        const shuffledPlacements = shuffle(allPlacements);
    
        // Assign each graduate to a random placement
        const result: TMatching = new Map();
        this.graduatePreferences.forEach((graduate: IGraduatePreference) => {
            result.set(graduate.id, shuffledPlacements.shift());
        });
    
        return result;
    }

    // Takes a solution and scores it based on how well the placements match
    calculateFitness (solution: TMatching): number {
        let fitness: number = 0;
    
        solution.forEach((placementId: number, graduateId: number) => {
            const graduate: IGraduatePreference | undefined = this.graduatePreferences.find((g: IGraduatePreference) => g.id === graduateId);
            const placement: IPlacement | undefined = this.placements.find((p: IPlacement) => p.id === placementId);
    
            if (graduate && placement) {
                // For the placement reverse the graduate rankings so the earlier the item is found the lower the score that is given
                const placementRanking: number = placement.graduateRankings.indexOf(graduate.id);
                if(placementRanking > -1) fitness += this.placementMaxRankings - placementRanking;
    
                // For the graduate reverse the placement rankings so the earlier the item is found the lower the score that is given
                const graduateRanking: number = graduate.placementRankings.indexOf(placement.id);
                if(graduateRanking > -1) fitness += this.graduateMaxRankings - graduateRanking;
            }
        });
    
        return fitness;
    }
}

export default GeneticMatching;
