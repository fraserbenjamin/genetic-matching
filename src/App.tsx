import React, { useCallback, useState } from "react";
import { graduatePreferences, placements as placementsImport } from "./common/app";
import GeneticMatching from "./common/geneticMatching";
import Config from "./components/Config";
import PreferenceUpload from "./components/PreferenceUpload";
import { IChromosome, IConfig, IGraduatePreference, IPreview, TMatching } from "./types";

const App = () => {
  const [graduates, setGraduates] = React.useState<IPreview | null>(null);
  const [placements, setPlacements] = React.useState<IPreview | null>(null);
  const [config, setConfig] = React.useState<IConfig>({
    populationSize: 100,
    iterations: 1000,
    managerWeighting: 50,
  });
  const [solution, setSolution] = useState<null | TMatching>(null);

  const run = useCallback(() => {
    // if (!graduates || !placements) return;
    // const gradPrefs: IGraduatePreference[] = graduates.json.map((row: any) => ({
    //   id: parseInt(row.Grad),
    //   placementRankings: 
    // }));

    const gm = new GeneticMatching(graduatePreferences, placementsImport);
    gm.setManagerWeighting(config.managerWeighting);
    const matchings: IChromosome = gm.run(config.iterations, config.populationSize, console.log);
    console.log(matchings)
    gm.evaluate(matchings.solution);
    setSolution(matchings.solution);
  }, [graduates, placements, config]);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col items-center">
      <div className="flex flex-col p-3 max-w-xl w-full space-y-3">
        <h1 className="text-xl p-3 font-medium">Graduate Preference Matching</h1>

        <PreferenceUpload preferences={graduates} setPreferences={setGraduates} label="Update Graduate Prefences" />
        <PreferenceUpload preferences={placements} setPreferences={setPlacements} label="Update Placement Prefences" />

        <Config config={config} setConfig={setConfig} />

        <button type="button" onClick={run} className="text-white bg-green-700 hover:bg-green-800 disabled:bg-green-400 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Run</button>
        {/* <button type="button" onClick={run} disabled={graduates === null || placements === null} className="text-white bg-green-700 hover:bg-green-800 disabled:bg-green-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Run</button> */}

        {solution ? (
          <div>
            <h2 className="text-xl p-3 font-medium">Solution</h2>
            <p className="flex flex-col bg-gray-200 rounded-lg py-3 px-5 mx-3">
              {Array.from(solution.entries()).map(([key, value]) => (
                <span>Graduate {key} has placement {value}</span>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
