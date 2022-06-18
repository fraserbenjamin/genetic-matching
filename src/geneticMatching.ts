import { randomNumber, shuffle } from "./util";

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
    calculateFitness(solution: TMatching): number {
        let fitness: number = 0;

        solution.forEach((placementId: number, graduateId: number) => {
            const graduate: IGraduatePreference | undefined = this.graduatePreferences.find((g: IGraduatePreference) => g.id === graduateId);
            const placement: IPlacement | undefined = this.placements.find((p: IPlacement) => p.id === placementId);

            if (graduate && placement) {
                // For the placement reverse the graduate rankings so the earlier the item is found the lower the score that is given
                const placementRanking: number = placement.graduateRankings.indexOf(graduate.id);
                if (placementRanking > -1) fitness += this.placementMaxRankings - placementRanking;

                // For the graduate reverse the placement rankings so the earlier the item is found the lower the score that is given
                const graduateRanking: number = graduate.placementRankings.indexOf(placement.id);
                if (graduateRanking > -1) fitness += this.graduateMaxRankings - graduateRanking;
            }
        });

        return fitness;
    }

    sortPopulation(population: IChromosome[]): IChromosome[] {
        return population.sort((a: IChromosome, b: IChromosome) => {
            return b.fitness - a.fitness;
        });
    }

    crossover(parent1: TMatching, parent2: TMatching): void {


    }

    // Randomly swap two of the placements in the solution
    mutation(chromosome: TMatching): TMatching {
        if (Math.random() < 0.4) return chromosome;
        const index1: number = randomNumber(1, chromosome.size);
        const index2: number = randomNumber(1, chromosome.size);

        let temp: number = chromosome.get(index1) || 0;
        chromosome.set(index1, chromosome.get(index2) || 0);
        chromosome.set(index2, temp);

        return chromosome;
    }

    run(iterations: number, populationSize?: number, keep?: number): IChromosome {
        if (!populationSize) populationSize = 10;
        if (!keep) keep = Math.ceil(populationSize * 0.05) + 1; // Keep best ~5% of the population

        // Create a new population of random solutions
        let population: IChromosome[] = [];
        for (let j = 0; j < populationSize; j++) {
            let solution: TMatching = this.generateRandomSolution();
            population.push({
                solution: solution,
                fitness: this.calculateFitness(solution),
            });
        }

        // Run for each of the required iterations, more iterations = more accurate results
        for (let i = 0; i < iterations; i++) {
            // Sort the population by fitness
            let sortedPopulation: IChromosome[] = this.sortPopulation(population);
            // Keep the best solutions
            let newPopulation: IChromosome[] = sortedPopulation.slice(0, keep);

            // Mutation
            for (let j = keep - 1; j < populationSize; j++) {
                let newChromosome: IChromosome = sortedPopulation[j];
                newChromosome.solution = this.mutation(newChromosome.solution);
                newChromosome.fitness = this.calculateFitness(newChromosome.solution);
                newPopulation.push(newChromosome);
            }

            // Keep array to fixed size
            population = newPopulation.slice(0, populationSize);
        }


        return population[0];
    }

    evaluate(solution: TMatching): void {
        let graduateFirstChoice: number = 0;
        let graduateTop3: number = 0;

        let managerFirstChoice: number = 0;
        let managerTop3: number = 0;

        solution.forEach((placementId: number, graduateId: number) => {
            const graduate: IGraduatePreference | undefined = this.graduatePreferences.find((g: IGraduatePreference) => g.id === graduateId);
            const placement: IPlacement | undefined = this.placements.find((p: IPlacement) => p.id === placementId);

            if (graduate && placement) {
                if(graduate.placementRankings[0] === placementId) graduateFirstChoice++;
                if(graduate.placementRankings.slice(0,2).includes(placementId)) graduateTop3++;

                if(placement.graduateRankings[0] === graduateId) managerFirstChoice++;
                if(placement.graduateRankings.slice(0,2).includes(graduateId)) managerTop3++;
            }
        });

        console.log(`Graduates with their first choice: ${graduateFirstChoice}/${this.graduatePreferences.length}`);
        console.log(`Graduates with one of their top 3 choices: ${graduateTop3}/${this.graduatePreferences.length}`);

        console.log(`Managers with their first choice: ${managerFirstChoice}/${this.placements.length}}`);
        console.log(`Managers with one of their top 3 choices: ${managerTop3}/${this.placements.length}`);
    }
}

export default GeneticMatching;
