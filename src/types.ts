export interface IGraduatePreference {
    id: number;
    placementRankings: number[];
}

export interface IPlacement {
    id: number;
    graduateRankings: number[];
    quota: number;
}

export type TMatching = Map<number, number>;

export interface IChromosome {
    solution: TMatching;
    fitness: number;
}

export interface IPairing {
    graduate: number;
    placement: number;
}

export interface IPreview {
    csv: string;
    json: any[];
    name: string;
}

export interface IConfig {
    populationSize: number;
    iterations: number;
    managerWeighting: number;
}

export interface ISolution {
    solution: TMatching;
    fitness?: number;
    evaluation?: string[];
    managerWeighting?: number;
}