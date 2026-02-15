const { webContents } = require('electron');

let mainWebContentsId;

const setMainWebContentsById = (id) => {
  mainWebContentsId = id;
};

const getMainWebContents = () => {
  const allWebContents = webContents.getAllWebContents();

  return allWebContents.find((wc) => wc.id === mainWebContentsId);
};

module.exports = {
  setMainWebContentsById,
  getMainWebContents,
};
