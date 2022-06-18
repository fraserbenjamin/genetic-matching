interface IGraduatePreference {
    id: number;
    placementRankings: number[];
}

interface IPlacement {
    id: number;
    graduateRankings: number[];
    quota: number;
}

type TMatching = Map<number, number>;