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