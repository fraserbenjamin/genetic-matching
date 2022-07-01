// Fisher-Yates Array Shuffle Algorithm
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
};

const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

class GeneticMatching {
    constructor(_graduatePreferences, _placements, _managerWeighting = 100) {
        this.graduatePreferences = _graduatePreferences;
        this.placements = _placements;
        this.managerWeighting = _managerWeighting;
        this.graduateMaxRankings = 10;
        this.placementMaxRankings = 10;
    }
    setManagerWeighting(weighting) {
        this.managerWeighting = weighting;
    }
    // Generates a random viable solution of placement matches
    generateRandomSolution() {
        const allPlacements = []; // Simple list of available placements e.g. [1, 2, 2, 3]
        this.placements.forEach((placement) => {
            for (let i = 0; i < placement.quota; i++) {
                allPlacements.push(placement.id);
            }
        });
        // Put placements into a random order to create a random valid solution
        const shuffledPlacements = shuffle(allPlacements);
        // Assign each graduate to a random placement
        const result = new Map();
        this.graduatePreferences.forEach((graduate) => {
            result.set(graduate.id, shuffledPlacements.shift());
        });
        return result;
    }
    // Takes a solution and scores it based on how well the placements match
    // You can also enter a percentage of how much the manager's preferences matter
    calculateFitness(solution) {
        let graduateFitness = 0;
        let placementFitness = 0;
        solution.forEach((placementId, graduateId) => {
            const graduate = this.graduatePreferences.find((g) => g.id === graduateId);
            const placement = this.placements.find((p) => p.id === placementId);
            if (graduate && placement) {
                // For the placement reverse the graduate rankings so the earlier the item is found the lower the score that is given
                const placementRanking = placement.graduateRankings.indexOf(graduate.id);
                if (placementRanking > -1)
                    placementFitness += this.placementMaxRankings - placementRanking;
                // For the graduate reverse the placement rankings so the earlier the item is found the lower the score that is given
                const graduateRanking = graduate.placementRankings.indexOf(placement.id);
                if (graduateRanking > -1)
                    graduateFitness += this.graduateMaxRankings - graduateRanking;
            }
        });
        // Factor the manager waiting into the fitness score
        if (typeof this.managerWeighting === "number" && this.managerWeighting >= 0 && this.managerWeighting <= 100) {
            if (this.managerWeighting === 0) {
                placementFitness = 0;
            }
            else {
                placementFitness = placementFitness * (this.managerWeighting / 100);
            }
        }
        return graduateFitness + placementFitness;
    }
    sortPopulation(population) {
        return population.sort((a, b) => {
            return b.fitness - a.fitness;
        });
    }
    // Roult-wheel selection to which is weighted by the fitness of the chromosomes
    select(population) {
        const totalFitness = population.reduce((acc, cur) => acc + cur.fitness, 0);
        const weights = population.map((chromosome) => chromosome.fitness / totalFitness);
        const accumulation = weights.reduce((acc, cur) => {
            acc.push(acc[acc.length - 1] + cur);
            return acc;
        }, [0]);
        accumulation.shift();
        const random = randomNumber(0, 1);
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
    crossover(input1, input2) {
        const parent1 = input1.solution;
        const parent2 = input2.solution;
        if (parent1.size !== parent2.size)
            return [input1, input2];
        const crossoverPoint = randomNumber(0, parent1.size - 1);
        const crossoverLength = Math.floor(parent1.size / 2);
        let chromosome1 = Array.from(parent1.entries()).map(([key, value]) => ({ graduate: key, placement: value }));
        let chromosome2 = Array.from(parent2.entries()).map(([key, value]) => ({ graduate: key, placement: value }));
        let newChromosome1 = [];
        let newChromosome2 = [];
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
            if (pointer >= chromosome1.length)
                pointer = 0;
        }
        // Add matches to the new chromosome that don't already exist
        chromosome2.forEach((pair) => {
            if (!newChromosome1.find((p) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome1.push(pair);
            }
        });
        chromosome1.forEach((pair) => {
            if (!newChromosome2.find((p) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome2.push(pair);
            }
        });
        // Add any original matches which are still compatible
        chromosome1.forEach((pair) => {
            if (!newChromosome1.find((p) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome1.push(pair);
            }
        });
        chromosome2.forEach((pair) => {
            if (!newChromosome2.find((p) => p.graduate === pair.graduate || p.placement === pair.placement)) {
                newChromosome2.push(pair);
            }
        });
        // Worst case some matches weren't able to be made
        let unmatchedGraduates1 = chromosome1.filter((pair) => !newChromosome1.map((p) => p.graduate).includes(pair.graduate)).map(p => p.graduate);
        let unmatchedGraduates2 = chromosome2.filter((pair) => !newChromosome2.map((p) => p.graduate).includes(pair.graduate)).map(p => p.graduate);
        let unmatchedPlacements1 = chromosome1.filter((pair) => !newChromosome1.map((p) => p.placement).includes(pair.placement)).map(p => p.placement);
        let unmatchedPlacements2 = chromosome2.filter((pair) => !newChromosome2.map((p) => p.placement).includes(pair.placement)).map(p => p.placement);
        unmatchedGraduates1.forEach((graduateId) => {
            newChromosome1.push({
                graduate: graduateId,
                placement: unmatchedPlacements1.shift(),
            });
        });
        unmatchedGraduates2.forEach((graduateId) => {
            newChromosome2.push({
                graduate: graduateId,
                placement: unmatchedPlacements2.shift(),
            });
        });
        let result1 = new Map();
        let result2 = new Map();
        newChromosome1.forEach((pair) => {
            result1.set(pair.graduate, pair.placement);
        });
        newChromosome2.forEach((pair) => {
            result2.set(pair.graduate, pair.placement);
        });
        // Check in case of undefined values
        result1.forEach((placementId, graduateId) => {
            if (!placementId || !graduateId)
                result1 = parent1;
        });
        result2.forEach((placementId, graduateId) => {
            if (!placementId || !graduateId)
                result1 = parent2;
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
    mutation(chromosome) {
        const solution = chromosome.solution;
        const index1 = randomNumber(1, solution.size);
        const index2 = randomNumber(1, solution.size);
        let temp = solution.get(index1) || 0;
        solution.set(index1, solution.get(index2) || 0);
        solution.set(index2, temp);
        return {
            solution,
            fitness: this.calculateFitness(solution),
        };
    }
    run(iterations, populationSize) {
        if (!populationSize)
            populationSize = 10;
        const keep = 2; // Keep best of the population
        // Create a new population of random solutions
        let population = [];
        for (let j = 0; j < populationSize; j++) {
            let solution = this.generateRandomSolution();
            population.push({
                solution: solution,
                fitness: this.calculateFitness(solution),
            });
        }
        // Run for each of the required iterations, more iterations = more accurate results
        for (let i = 1; i <= iterations; i++) {
            const progress = (i / iterations) * 100;
            if (progress % 1 === 0) {
                postMessage({
                    type: "progress",
                    payload: progress,
                });
            }

            // Sort the population by fitness
            let sortedPopulation = this.sortPopulation(population);
            // Keep the best solutions
            let newPopulation = sortedPopulation.slice(0, keep);
            let choice1 = this.select(sortedPopulation);
            let choice2 = this.select(sortedPopulation);
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
    evaluate(solution) {
        const response = [];
        let graduateFirstChoice = 0;
        let graduateTop3 = 0;
        let managerFirstChoice = 0;
        let managerTop3 = 0;
        solution.forEach((placementId, graduateId) => {
            const graduate = this.graduatePreferences.find((g) => g.id === graduateId);
            const placement = this.placements.find((p) => p.id === placementId);
            if (graduate && placement) {
                if (graduate.placementRankings[0] === placementId)
                    graduateFirstChoice++;
                if (graduate.placementRankings.slice(0, 2).includes(placementId))
                    graduateTop3++;
                if (placement.graduateRankings[0] === graduateId)
                    managerFirstChoice++;
                if (placement.graduateRankings.slice(0, 2).includes(graduateId))
                    managerTop3++;
            }
        });
        response.push(`Graduates with their first choice: ${graduateFirstChoice}/${this.graduatePreferences.length}`);
        response.push(`Graduates with one of their top 3 choices: ${graduateTop3}/${this.graduatePreferences.length}`);
        response.push(`Managers with their first choice: ${managerFirstChoice}/${this.placements.length}}`);
        response.push(`Managers with one of their top 3 choices: ${managerTop3}/${this.placements.length}`);
        return response;
    }
}

let gm = null;

onmessage = (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case "init":
            const { graduatePreferences, placements } = payload;
            gm = new GeneticMatching(graduatePreferences, placements);
            break;
        case "run":
            if (!gm) break;
            const { iterations, populationSize, managerWeighting } = payload;

            if(managerWeighting) gm.setManagerWeighting(managerWeighting);

            const result = gm.run(iterations, populationSize);
            postMessage({
                type: "result",
                payload: {
                    solution: result.solution,
                    fitness: result.fitness,
                    managerWeighting: gm.managerWeighting,
                    evaluation: gm.evaluate(result.solution),
                },
            });
            break;
        case "evaluate":
            if (!gm) break;
            const response = gm.evaluate(payload.solution);
            postMessage({
                type: "evaluate",
                payload: response,
            });
            break;
        default:
            console.log("Unknown message type: " + type);
    }
};