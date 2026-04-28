import xlsx from 'xlsx';

export const readExcelFile = async (filePath) => {
  try {
    const path = '';
    const file = xlsx.readFile(`${filePath}`);
    let data = [];
    const sheets = file.SheetNames;
    for (let i = 0; i < sheets.length; i++) {
      const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
      temp.forEach((res) => {
        data.push(res);
      });
    }
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
};
