import React, { useCallback, useState } from "react";
import Config from "./components/Config";
import PreferenceUpload from "./components/PreferenceUpload";
import { IConfig, IGraduatePreference, IPlacement, IPreview, ISolution } from "./types";

const App = () => {
  const [graduates, setGraduates] = React.useState<IPreview | null>(null);
  const [placements, setPlacements] = React.useState<IPreview | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [config, setConfig] = React.useState<IConfig>({
    populationSize: 100,
    iterations: 1000,
    managerWeighting: 50,
  });
  const [solution, setSolution] = useState<null | ISolution>(null);

  const formattedGraduates: IGraduatePreference[] = React.useMemo(() => {
    if (!graduates) return [];

    const rows = graduates.csv.split("\n").slice(1);
    return rows.map((row: string) => {
      const cells = row.split(",");
      return {
        id: parseInt(cells[0].replace(/\D/g, "")),
        placementRankings: cells.slice(1).map((cell: string) => parseInt(cell.replace(/\D/g, ""))),
      };
    });
  }, [graduates]);

  const formattedPlacements: IPlacement[] = React.useMemo(() => {
    if (!placements) return [];

    const rows = placements.csv.split("\n").slice(1);
    return rows.map((row: string) => {
      const cells = row.split(",");
      return {
        id: parseInt(cells[0].replace(/\D/g, "")),
        quota: parseInt(cells[1].replace(/\D/g, "")),
        graduateRankings: cells.slice(2).map((cell: string) => parseInt(cell.replace(/\D/g, ""))),
      };
    });
  }, [placements]);

  const run = useCallback(() => {
    const webWorker: Worker = new window.Worker("genetic-worker.js");
    webWorker.onmessage = (e) => {
      switch (e.data.type) {
        case "progress":
          setProgress(e.data.payload);
          break;
        case "result":
          setSolution(e.data.payload);
          break;
        default:
          console.log(e.data);
      }
    }

    webWorker.postMessage({
      type: "run",
      payload: {
        graduatePreferences: formattedGraduates,
        placements: formattedPlacements,
        iterations: config.iterations,
        populationSize: config.populationSize,
        managerWeighting: config.managerWeighting,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graduates, placements, config]);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col items-center">
      <div className="flex flex-col p-3 max-w-xl w-full space-y-3">
        <h1 className="text-xl p-3 font-medium">Graduate Preference Matching</h1>

        <PreferenceUpload preferences={graduates} setPreferences={setGraduates} label="Update Graduate Prefences" />
        <PreferenceUpload preferences={placements} setPreferences={setPlacements} label="Update Placement Prefences" />

        <Config config={config} setConfig={setConfig} />

        <button type="button" onClick={run} className="text-white bg-green-700 hover:bg-green-800 disabled:bg-green-400 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
          {progress > 0 ? `${progress}%` : "Run"}
        </button>
        {/* <button type="button" onClick={run} disabled={graduates === null || placements === null} className="text-white bg-green-700 hover:bg-green-800 disabled:bg-green-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Run</button> */}

        {solution ? (
          <div>
            <h2 className="text-xl p-3 font-medium">Solution</h2>
            <p className="flex flex-col bg-gray-200 rounded-lg py-3 px-5 mx-3">
              {Array.from(solution.solution.entries()).map(([key, value]) => (
                <span key={key}>Graduate {key} has placement {value}</span>
              ))}
            </p>

            <h2 className="text-xl p-3 font-medium">Evaluation</h2>
            <p className="flex flex-col bg-gray-200 rounded-lg py-3 px-5 mx-3">
              {Array.isArray(solution?.evaluation) ?
                solution.evaluation.map((item: string, i: number) => (
                  <span key={i}>{item}</span>
                ))
                : null}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
