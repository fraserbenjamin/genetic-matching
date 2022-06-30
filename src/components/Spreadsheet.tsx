import ReactSpreadsheet from "react-spreadsheet";

const Spreadsheet = () => {
  const data = [
    [{ value: "Vanilla", readOnly: true }, { value: "Chocolate", readOnly: true }],
    [{ value: "Strawberry", readOnly: true }, { value: "Cookies", readOnly: true }],
  ];
  return <ReactSpreadsheet data={data} />;
};

export default Spreadsheet;