import { IChromosome, IGraduatePreference, IPairing, IPlacement, TMatching } from "../types";
import { randomNumber, shuffle } from "./util";

class GeneticMatching {
    private graduatePreferences: IGraduatePreference[];
    private placements: IPlacement[];

    private graduateMaxRankings: number;
    private placementMaxRankings: number;

    private managerWeighting: number;

    constructor(_graduatePreferences: IGraduatePreference[], _placements: IPlacement[], _managerWeighting: number = 100) {
        this.graduatePreferences = _graduatePreferences;
        this.placements = _placements;
        this.managerWeighting = _managerWeighting;

        this.graduateMaxRankings = 10;
        this.placementMaxRankings = 10;
    }

    setManagerWeighting(weighting: number) {
        this.managerWeighting = weighting;
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
    // You can also enter a percentage of how much the manager's preferences matter
    calculateFitness(solution: TMatching): number {
        let graduateFitness: number = 0;
        let placementFitness: number = 0;

        solution.forEach((placementId: number, graduateId: number) => {
            const graduate: IGraduatePreference | undefined = this.graduatePreferences.find((g: IGraduatePreference) => g.id === graduateId);
            const placement: IPlacement | undefined = this.placements.find((p: IPlacement) => p.id === placementId);

            if (graduate && placement) {
                // For the placement reverse the graduate rankings so the earlier the item is found the lower the score that is given
                const placementRanking: number = placement.graduateRankings.indexOf(graduate.id);
                if (placementRanking > -1) placementFitness += this.placementMaxRankings - placementRanking;

                // For the graduate reverse the placement rankings so the earlier the item is found the lower the score that is given
                const graduateRanking: number = graduate.placementRankings.indexOf(placement.id);
                if (graduateRanking > -1) graduateFitness += this.graduateMaxRankings - graduateRanking;
            }
        });

        // Factor the manager waiting into the fitness score
        if(typeof this.managerWeighting === "number" && this.managerWeighting >= 0 && this.managerWeighting <= 100) {
            if(this.managerWeighting === 0) {
                placementFitness = 0;
            } else {
                placementFitness = placementFitness * (this.managerWeighting / 100);
            }
        }

        return graduateFitness + placementFitness;
    }

    sortPopulation(population: IChromosome[]): IChromosome[] {
        return population.sort((a: IChromosome, b: IChromosome) => {
            return b.fitness - a.fitness;
        });
    }

    // Roult-wheel selection to which is weighted by the fitness of the chromosomes
    select(population: IChromosome[]): IChromosome {
        const totalFitness: number = population.reduce((acc: number, cur: IChromosome) => acc + cur.fitness, 0);
        const weights: number[] = population.map((chromosome: IChromosome) => chromosome.fitness / totalFitness);
        const accumulation: number[] = weights.reduce((acc: number[], cur: number) => {
            acc.push(acc[acc.length - 1] + cur);
            return acc;
        }, [0]);
        accumulation.shift();

        const random: number = randomNumber(0, 1);
        let chosenIndex = -1;

        for (let i = 1; i < accumulation.length; i++) {
            if (random < accumulation[i]) {
                chosenIndex = i;
                break;
            }
        }

        return population[chosenIndex];
    }

    // Crossover between two chromosomes - needs improving
    crossover(input1: IChromosome, input2: IChromosome): IChromosome[] {
        const parent1 = input1.solution;
        const parent2 = input2.solution;

        if (parent1.size !== parent2.size) return [input1, input2];

        const crossoverPoint = randomNumber(0, parent1.size - 1);
        const crossoverLength = Math.floor(parent1.size / 2);

        let chromosome1 = Array.from(parent1.entries()).map(([key, value]: number[]) => ({ graduate: key, placement: value }));
        let chromosome2 = Array.from(parent2.entries()).map(([key, value]: number[]) => ({ graduate: key, placement: value }));

        let newChromosome1: IPairing[] = [];
        let newChromosome2: IPairing[] = [];

        // Copy half of the original chromosome to the new chromosome
        let pointer = crossoverPoint;
        for (let i = 0; i < crossoverLength; i++) {
            newChromosome1.push({
                graduate: chromosome1[pointer].graduate,
                placement: chromosome1[pointer].placement,
            });
            newChromosome2.push({
                graduate: chromosome2[pointer].graduate,
                placement: chromosome2[pointer].placement,
            });
            pointer++;
            if (pointer >= chromosome1.length) pointer = 0;
        }

        // Add matches to the new chromosome that don't already exist
        chromosome2.forEach((pair: IPairing) => {
            if (!newChromosome1.find((p: IPairing) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome1.push(pair);
            }
        });
        chromosome1.forEach((pair: IPairing) => {
            if (!newChromosome2.find((p: IPairing) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome2.push(pair);
            }
        });

        // Add any original matches which are still compatible
        chromosome1.forEach((pair: IPairing) => {
            if (!newChromosome1.find((p: IPairing) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome1.push(pair);
            }
        });
        chromosome2.forEach((pair: IPairing) => {
            if (!newChromosome2.find((p: IPairing) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome2.push(pair);
            }
        });

        // Worst case some matches weren't able to be made
        let unmatchedGraduates1: number[] = chromosome1.filter((pair: IPairing) => !newChromosome1.map((p: IPairing) => p.graduate).includes(pair.graduate)).map(p => p.graduate);
        let unmatchedGraduates2: number[] = chromosome2.filter((pair: IPairing) => !newChromosome2.map((p: IPairing) => p.graduate).includes(pair.graduate)).map(p => p.graduate);

        let unmatchedPlacements1: number[] = chromosome1.filter((pair: IPairing) => !newChromosome1.map((p: IPairing) => p.placement).includes(pair.placement)).map(p => p.placement);
        let unmatchedPlacements2: number[] = chromosome2.filter((pair: IPairing) => !newChromosome2.map((p: IPairing) => p.placement).includes(pair.placement)).map(p => p.placement);

        unmatchedGraduates1.forEach((graduateId: number) => {
            newChromosome1.push({
                graduate: graduateId,
                placement: unmatchedPlacements1.shift() as number,
            });
        });
        unmatchedGraduates2.forEach((graduateId: number) => {
            newChromosome2.push({
                graduate: graduateId,
                placement: unmatchedPlacements2.shift() as number,
            });
        });

        let result1 = new Map<number, number>();
        let result2 = new Map<number, number>();
        newChromosome1.forEach((pair: IPairing) => {
            result1.set(pair.graduate, pair.placement);
        });
        newChromosome2.forEach((pair: IPairing) => {
            result2.set(pair.graduate, pair.placement);
        });

        // Check in case of undefined values
        result1.forEach((placementId: number, graduateId: number) => {
            if (!placementId || !graduateId) result1 = parent1;
        });
        result2.forEach((placementId: number, graduateId: number) => {
            if (!placementId || !graduateId) result1 = parent2;
        });

        return [
            {
                solution: result1,
                fitness: this.calculateFitness(result1),
            },
            {
                solution: result2,
                fitness: this.calculateFitness(result2),
            },
        ];
    }

    // Randomly swap two of the placements in the solution
    mutation(chromosome: IChromosome): IChromosome {
        const solution = chromosome.solution;

        const index1: number = randomNumber(1, solution.size);
        const index2: number = randomNumber(1, solution.size);

        let temp: number = solution.get(index1) || 0;
        solution.set(index1, solution.get(index2) || 0);
        solution.set(index2, temp);

        return {
            solution,
            fitness: this.calculateFitness(solution),
        };
    }

    run(iterations: number, populationSize?: number, onProgress?: (progress: number) => void): IChromosome {
        // console.log(`Starting genetic algorithm with ${iterations} iterations and ${populationSize} population size`);
        if (!populationSize) populationSize = 10;
        const keep = 2; // Keep best of the population

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
        for (let i = 1; i <= iterations; i++) {
            const progress: number = (i / iterations) * 100;
            if(onProgress && progress % 1 === 0) onProgress(progress);

            // Sort the population by fitness
            let sortedPopulation: IChromosome[] = this.sortPopulation(population);
            // Keep the best solutions
            let newPopulation: IChromosome[] = sortedPopulation.slice(0, keep);

            let choice1: IChromosome = this.select(sortedPopulation);
            let choice2: IChromosome = this.select(sortedPopulation);

            while (newPopulation.length < populationSize) {
                // Crossover
                if (Math.random() < 0.3) {
                    const crossoverResult = this.crossover(choice1, choice2);
                    choice1 = crossoverResult[0];
                    choice2 = crossoverResult[1];
                }

                // Mutation
                if (Math.random() < 0.6) {
                    choice1 = this.mutation(choice1);
                    choice2 = this.mutation(choice2);
                }

                newPopulation.push(choice1);
                newPopulation.push(choice2);
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
                if (graduate.placementRankings[0] === placementId) graduateFirstChoice++;
                if (graduate.placementRankings.slice(0, 2).includes(placementId)) graduateTop3++;

                if (placement.graduateRankings[0] === graduateId) managerFirstChoice++;
                if (placement.graduateRankings.slice(0, 2).includes(graduateId)) managerTop3++;
            }
        });

        console.log(`Graduates with their first choice: ${graduateFirstChoice}/${this.graduatePreferences.length}`);
        console.log(`Graduates with one of their top 3 choices: ${graduateTop3}/${this.graduatePreferences.length}`);

        console.log(`Managers with their first choice: ${managerFirstChoice}/${this.placements.length}}`);
        console.log(`Managers with one of their top 3 choices: ${managerTop3}/${this.placements.length}`);
    }
}

export default GeneticMatching;
