let chartSizeDict = { beg: 110, add: false, init: false };
let greyoutDiv, renderHandlerDiv, routeframeDiv, sourceframeDiv;

const playButton = document.getElementById("play");

const container1 = document.getElementById("container1");

const mapDOM = document.getElementById("map");
const mapRenDOM = document.getElementById("mapRen");

const downloadButton = document.getElementById("downloadButton");
const sourceButton = document.getElementById("add-source");
const trackButton = document.getElementById("add-trackPoint");
const routeButton = document.getElementById("add-route");

const previewSwitchButton = document.getElementById("previewSwitch");
const previewButton = document.getElementById("previewButton");

const zoomInput = document.getElementById("zoomIn");
const xInput = document.getElementById("xIn");
const yInput = document.getElementById("yIn");

const searchInput = document.getElementById("searchIn");
const framesDurationInput = document.getElementById("framesDurationIn");
const frames_sInput = document.getElementById("frames_sIn");

const rotationInput = document.getElementById("rotationIn");

const infoId = document.getElementById("info-id");
const addButton = document.getElementById("addMarker");
const moveButton = document.getElementById("moveMarker");
const delButton = document.getElementById("delMarker");

const renWidthInput = document.getElementById("renWidthIn");
const renHeightInput = document.getElementById("renHeightIn");

const previewCanvas = document.querySelector(".previewCanvas");
const previewContext = previewCanvas.getContext("2d");

const valuePannel = document.querySelector(".value-pannel");

const canvSel = document.querySelector(".control-pannel");
const canvSelCtx = canvSel.getContext("2d");

const canvWrapper = document.querySelector(".chartAreaWrapper");
const canvCon = document.getElementById("chartContainer");
const canv = document.getElementById("chart");
const ctx = canv.getContext("2d");

let orgCanvWidth = null,
  orgCanvHeight = null;

const resizeEW = document.querySelector(".chart-axes-control");

const rootStyle = getComputedStyle(document.querySelector(":root"));

let viewT = new ol.View({
  center: ol.proj.fromLonLat([12.471555531078746, 41.87993470000001]),
  constrainRotation: false,
  zoom: 4,
  multiWorld: true,
  showFullExtent: true,
});
let viewR = new ol.View({
  center: [0, 0],
  constrainRotation: false,
  zoom: 4,
  multiWorld: true,
  showFullExtent: true,
});

const styleChart = {
  main_pannel: rootStyle.getPropertyValue("--main-pannel"),
  main_back: rootStyle.getPropertyValue("--main-back"),
  main_border: rootStyle.getPropertyValue("--main-border"),
  main_button: rootStyle.getPropertyValue("--main-button"),
  main_inner: rootStyle.getPropertyValue("--main-inner"),
};

let scaleView = 1;

let last_resizepos = null;
let last_resizeX = null;

let mapSourceType; //'xyz'
const XYZURLS = [
  {
    name: "osm",
    list: [
      {
        name: "osm",
        extension: "png",
      },
    ],
    url(v) {
      return "https://tile.openstreetmap.org/{z}/{x}/{y}." + v.extension;
    },
  },

  {
    name: "stamen",
    list: [
      {
        name: "terrain",
        extension: "jpg",
      },
      {
        name: "terrain-background",
        extension: "jpg",
      },
      {
        name: "terrain-labels",
        extension: "png",
      },
      {
        name: "terrain-lines",
        extension: "png",
      },
      {
        name: "toner-background",
        extension: "png",
      },
      {
        name: "toner",
        extension: "png",
      },
      {
        name: "toner-hybrid",
        extension: "png",
      },
      {
        name: "toner-labels",
        extension: "png",
      },
      {
        name: "toner-lines",
        extension: "png",
      },
      {
        name: "toner-lite",
        extension: "png",
      },
      {
        name: "watercolor",
        extension: "jpg",
      },
    ],
    url(v) {
      return (
        "https://stamen-tiles-{a-d}.a.ssl.fastly.net/" +
        v.name +
        "/{z}/{x}/{y}." +
        v.extension
      );
    },
  },

  {
    name: "CARTO",
    list: [
      {
        name: "voyager_labels_under",
        extension: "png",
      },
      {
        name: "voyager_nolabels",
        extension: "png",
      },
      {
        name: "light_all",
        extension: "png",
      },
      {
        name: "light_nolabels",
        extension: "png",
      },
      {
        name: "dark_all",
        extension: "png",
      },
      {
        name: "dark_nolabels",
        extension: "png",
      },
    ],
    url(v) {
      return (
        "https://{a-d}.basemaps.cartocdn.com/rastertiles/" +
        v.name +
        "/{z}/{x}/{y}." +
        v.extension
      );
    },
  },
  {
    name: "ArcGIS REST",
    list: [
      {
        name: "World_Topo_Map",
      },
      {
        name: "World_Physical_Map",
      },
      {
        name: "World_Imagery",
      },
    ],
    url(v) {
      return (
        "https://server.arcgisonline.com/ArcGIS/rest/services/" +
        v.name +
        "/MapServer/tile/{z}/{y}/{x}"
      );
    },
  },
];

let markerDict = {
  map: [],
};
let chartDict = {
  indexToName: {
    1: "map",
  },
  indexToData: {
    map: 1,
  },
  map: "map",
};

let sortedDict = {
  map: {
    start: null,
    end: null,
  },
};

let layersDict = {
  lay: {
    map: null,
    line: null,
    bez: { point: null, lines: null },
    track: null,
  },
  source: {
    size: 0,
    data: {},
  },
  chart: {
    size: 1,
  },
  panel: [],
};

const defaultLay = {
  map: {
    xyz: "",
    attribution: "",
  },
  geo: {
    layer: "geo",
    name: "",
    title: "",
    opacity: 0.5,
    color: [100, 0, 0],
    colorstroke: [0, 0, 0],
    opacitystroke: 1,
    widthStroke: 1,
  },
  route: {
    layer: "route",
    name: "",
    title: "",
    colorstroke: [0, 0, 0],
    opacitystroke: 1,
    widthStroke: 1,
    lineDash: [0, 0],
    lineCap: "round",
    lineJoin: "round",
    lineDashOffset: 0,
    start: 0,
    end: 100,
  },
};

let curSel = [];
let curSelChar = [];

function hextoRgb(hex) {
  let res = [];
  rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
    .exec(hex)
    .slice(1)
    .map((x) => parseInt(x, 16));
  if (rgb) res = rgb;
  return res;
}

function rgbtoHex(rgb) {
  return (
    "#" +
    ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)
  );
}

function aeScriptCamera(res, firstF, s_frame) {
  this._firstF = firstF;
  this._position = res.map((x) => x / 2);
  this._positionLast = this._position;
  this._center = this._firstF.center;
  this._scale = 100 / this._firstF.zoom;
  this._s_frame = s_frame / 1000;

  this._trackPos = [];
  this.trackLists = [];

  this.begin = "var addTrackpoints = function() {\n";

  this.timeList = "var timeList = [";
  this.positionList = "var positionList = ";
  this.scaleList = "var scaleList = [";
  this.scaleRotation = "var RotationList = [";

  this.mainFunction =
    'var activeComp = app.project.activeItem;\
  \nif(activeComp && activeComp instanceof CompItem){\
  \napp.beginUndoGroup("Add trackpoint nulls");\
  \nvar time_frame = 1/activeComp.frameRate;\
  \nfor(var l = 0; l< positionList.length; l++){\
  \nvar nullPoint = activeComp.layers.addNull();\
  \nnullPoint.name = "Trackpoint " + l;\
  \nfor(var s = 0; s< timeList.length; s++){\
  \nvar newKeyTime = timeList[s]*time_frame;\
  \nnullPoint.transform.position.setValueAtTime(newKeyTime,positionList[l][s]);\
  \nnullPoint.transform.scale.setValueAtTime(newKeyTime,scaleList[s]);\
  \nnullPoint.transform.rotation.setValueAtTime(newKeyTime,RotationList[s]);\
  \n}\
  \n}\
  \napp.endUndoGroup();\
  \n}\
  \n}';

  this.end = "\naddTrackpoints();\
  \naddTrackpoints = null;";

  this._trackPos.push(this._center);
  for (let fea of layersDict["lay"]["track"].getSource().getFeatures()) {
    if (fea.get("name") === "track") {
      this._trackPos.push(fea.getGeometry().getCoordinates());
    }
  }

  for (let i = 0, d = chartT.data.datasets.length; i < d; i++) {
    if (chartT.data.datasets[i].use === false) continue;

    let ch = chartDict["indexToName"][i];
    if (chartDict[ch] === "route") {
      for (let x of chartT.data.datasets[i].waypoints) {
        this._trackPos.push(x);
      }
    }
  }

  this.trackLists = new Array(this._trackPos.length);
  for (let t = 0; t < this.trackLists.length; ++t)
    this.trackLists[t] = new Array(0);

  this.addTime = function (val) {
    this.timeList += String(val) + ",";
  };

  this.addPosition = function () {
    for (let t = 0; t < this._trackPos.length; t++) {
      this.trackLists[t].push(
        mapRender.getPixelFromCoordinate(this._trackPos[t])
      );
    }
  };

  this.addScale = function (val) {
    const scale = this._scale * val;
    this.scaleList += JSON.stringify([scale, scale]) + ",";
  };

  this.addRotation = function (val) {
    this.scaleRotation += String(val * (180 / Math.PI)) + ",";
  };

  this.check = function (val) {
    let valList = val;
    if (valList.endsWith(",")) {
      valList = valList.slice(0, valList.length - 1);
    }
    return valList + "];\n";
  };

  this.whole = function () {
    return (
      this.begin +
      this.positionList +
      JSON.stringify(this.trackLists) +
      "\n" +
      this.check(this.timeList) +
      this.check(this.scaleList) +
      this.check(this.scaleRotation) +
      this.mainFunction +
      this.end
    );
  };
}

class TimeSequence {
  constructor(opts) {
    this.opts = {
      ...opts,
    };
    this.seq = { data: {}, length: 0, frames: [] };
    this._frame_s = 30;
    this.s_frame = 1000 / this._frame_s;
    frames_sInput.value = this._frame_s;

    this.proMap = {
      center: null,
      zoom: null,
    };
    this.proGeo = {
      opacity: null,
    };
    this.renderRes = [1920, 1080];
    this.previewRes = [960, 540];
    this.scaleRes = 1;
    this.scaleView = 1;
    renWidthInput.value = this.renderRes[0];
    renHeightInput.value = this.renderRes[1];

    this.xyz = "";
    this.progressEl = document.createElement("canvas");
    this.mapCanvas = document.createElement("canvas");
    this.mapCanvasRender = document.createElement("canvas");

    this.playButtons = [];
    this.play = false;
    this.playN = 0;
    this.exportN = 0;

    this.singleExport = true;
    this.exportTimeout = null;
    this.calcwholeTimeout = null;
    this.waitDrawInterval = null;
    this.exportNewTimeout = null;

    this.ae_script_camera = "";

    this.queue = {
      _parent: this,
      _groupNum: 0,
      _groups: {},
      _list: [],

      addGroup(v) {
        this._groupNum++;
        if (this._groupNum > 1000000) this._groupNum = 0;
        let nameGroup = String(this._groupNum);
        this._groups[nameGroup] = {
          _data: { _name: nameGroup },
          _list: [],
        };
        for (let key in v) {
          this._groups[nameGroup]._data[key] = v[key];
        }
        this._list.push(nameGroup);
        return nameGroup;
      },

      removeGroup(gr) {
        let res = false;

        const ind = this._list.indexOf(gr);
        if (ind >= 0) {
          this._list.splice(ind, 1);
          delete this._groups[gr];
          res = true;
        }
        return res;
      },

      add(gr, v) {
        this._groups[gr]._list.push([this._groups[gr]._data, v]);
        if (this._groups[gr]._list.length === 1) {
          if (this._list.length === 1) this.next();
        }
      },
      next() {
        if (this._list.length !== 0) {
          this._parent.exportMode(this._groups[this._list[0]]._list[0]);
        }
      },
      stop(gr) {
        if (this.removeGroup(gr)) {
          this.next();
        }
      },
      change(gr, v) {
        try {
          for (let key in v) {
            this._groups[gr]._data[key] = v[key];
          }
        } catch {}
      },
      end(gr, i) {
        if (this._groups.hasOwnProperty(gr)) {
          this._groups[gr]._list.shift();
          if (i === this._groups[gr]._data.end - 1) this.removeGroup(gr);
          this.next();
        }
      },
      deleteAll() {
        this._groups = {};
        this._list = [];
      },
    };

    this.imageLoad = 0;

    this.previewFrame = null;
    this.timeoutArray = [];

    this.zipIndex = {};

    this.playPos = { chartArea: {}, gridLine: [], data: [], preFrame: null };

    this.progressEl.classList.add("preview-progress");
    canvCon.appendChild(this.progressEl);
  }

  get frame_s() {
    return this._frame_s;
  }

  set frame_s(v) {
    this._frame_s = v;
    this.s_frame = 1000 / this._frame_s;
  }

  clear() {
    for (let x in this.seq["data"]) {
      if (this.seq["data"].hasOwnProperty(x)) {
        delete this.seq["data"][x];
      }
    }
    for (let x in this.seq["frames"]) {
      delete this.seq["frames"][x];
    }
    this.seq = { data: {}, length: 0, frames: [] };
    this.queue.deleteAll();
  }

  calcStart() {
    this.clear();
    let arr = [];
    for (let i = 1, n = chartT.data.datasets.length; i < n; i++) {
      let ch = chartDict["indexToName"][String(i)];
      let nextN = sortedDict[ch]["start"];
      if (nextN === null || nextN === undefined) continue;
      arr.push([chartT.data.datasets[i].data[nextN], ch]);
    }
    if (arr.length === 0) return false;
    else return true;
  }

  calcSeq() {
    if (!this.calcStart()) return false;
    let dataset;
    let da1, da2, cm1, cm2, layern, keystr;
    let duration, step, frameA;
    let change, changeRot, s;
    let xdiff = 0,
      ydiff = 0,
      zdiff = 0,
      strdiff = 0,
      widthdiff = 0,
      lineDashOffsetDiff = 0,
      rdiff = 0;

    let tarOpstroke,
      stOpstroke,
      colDiff,
      colStrokeDiff,
      dashDiff,
      stRouteDiff,
      endRouteDiff;

    for (let i = 1, n = chartT.data.datasets.length; i < n; i++) {
      dataset = chartT.data.datasets[i];
      if (dataset.data.length === 0 || dataset.use === false) continue;

      let ch = chartDict["indexToName"][String(i)];
      let nextN = sortedDict[ch]["start"];
      layern = chartDict[ch];
      this.seq["data"][ch] = { start: 0, end: 0, frames: [] };

      this.seq["data"][ch]["start"] = dataset.data[nextN].x;

      for (let z = 0, d = dataset.data.length; z < d; z++) {
        da1 = dataset.data[nextN];
        nextN = da1.next;

        if (nextN !== null) {
          da2 = dataset.data[nextN];

          cm1 = da1.indexmap;
          cm2 = da2.indexmap;

          duration = da2.x - da1.x;
          frameA = Math.round(duration * this.frame_s);
          duration = frameA / this.frame_s;
          frameA = da2.x - da1.x;
          step = 1 / frameA;
        } else {
          da2 = da1;
          cm1 = da1.indexmap;
          cm2 = cm1;
          step = 0;
          frameA = 1;
        }

        this.seq["data"][ch]["end"] = da2.x;
        switch (layern) {
          case "map":
            change = true;
            changeRot = true;
            let tarC = da2.center;
            let stC = da1.center;

            let tarZ = da2.zoom;
            let stZ = da1.zoom;

            let tarR = da2.rotation;
            let stR = da1.rotation;

            zdiff = (tarZ - stZ) * step;
            rdiff = (tarR - stR) * step;
            s = 0;

            if (tarR === 0 && stR === 0) {
              changeRot = false;
            }

            let bezPoints = [];

            if (da1.lines.next) {
              let mid = da1.lines.next.get("mid");
              if (mid) {
                if (mid.get("bez")) {
                  bezPoints = mid.get("points");
                  let bezLength = bezPoints.length - 1,
                    r;
                  for (let l = frameA; s < l; s++) {
                    r = s;
                    if (s > bezLength) r = bezLength;
                    this.seq["data"][ch]["frames"].push({
                      center: bezPoints[r],
                      zoom: stZ + zdiff * s,
                      rotation: stR + rdiff * s,
                      xyz: da1.xyz,
                      attribution: da1.attribution,
                      change: change,
                      changeRot: changeRot,
                      type: "step",
                      step: s,
                      total: l,
                    });
                  }
                }
              }
            }

            if (bezPoints.length === 0) {
              xdiff = (tarC[0] - stC[0]) * step;
              ydiff = (tarC[1] - stC[1]) * step;

              if (xdiff === 0 && ydiff === 0 && zdiff === 0 && rdiff === 0) {
                change = false;
              }

              for (let l = frameA; s < l; s++) {
                this.seq["data"][ch]["frames"].push({
                  center: [stC[0] + xdiff * s, stC[1] + ydiff * s],
                  zoom: stZ + zdiff * s,
                  rotation: stR + rdiff * s,
                  xyz: da1.xyz,
                  attribution: da1.attribution,
                  change: change,
                  changeRot: changeRot,
                  type: "step",
                  step: s,
                  total: l,
                });
              }
            }

            if (change === false) {
              if (this.seq["data"][ch]["frames"].length > 0) {
                let ind = this.seq["data"][ch]["frames"].length - s;
                this.seq["data"][ch]["frames"][ind].change = true;
              }
            }

            break;
          case "geo":
            change = true;
            let tarO = da2.opacity;
            let stO = da1.opacity;

            stOpstroke = da1.opacitystroke;

            zdiff = (tarO - stO) * step;
            strdiff = (da2.opacitystroke - stOpstroke) * step;
            widthdiff = (da2.widthStroke - da1.widthStroke) * step;

            colDiff = divideColor(da1.color, da2.color, step);
            colStrokeDiff = divideColor(da1.colorstroke, da2.colorstroke, step);

            if (
              zdiff === 0 &&
              strdiff === 0 &&
              colDiff["change"] === false &&
              colStrokeDiff["change"] === false
            ) {
              change = false;
            }

            s = 0;
            for (let l = frameA; s < l; s++) {
              this.seq["data"][ch]["frames"].push({
                opacity: stO + zdiff * s,
                opacitystroke: stOpstroke + strdiff * s,
                color: da1.color.map((x, ind) =>
                  Math.round(x + colDiff["list"][ind] * s)
                ),
                colorstroke: da1.colorstroke.map((x, ind) =>
                  Math.round(x + colStrokeDiff["list"][ind] * s)
                ),
                widthStroke: da1.widthStroke + widthdiff * s,
                change: change,
                changeRot: false,
                type: "step",
                step: s,
                total: l,
              });
            }

            if (change === false) {
              if (this.seq["data"][ch]["frames"].length > 0) {
                let ind = this.seq["data"][ch]["frames"].length - s;
                this.seq["data"][ch]["frames"][ind].change = true;
              }
            }

            break;

          case "route":
            change = true;
            let tarWidth = da2.widthStroke;
            let stWidth = da1.widthStroke;

            tarOpstroke = da2.opacitystroke;
            stOpstroke = da1.opacitystroke;

            widthdiff = (tarWidth - stWidth) * step;
            strdiff = (tarOpstroke - stOpstroke) * step;

            lineDashOffsetDiff =
              (da2.lineDashOffset - da1.lineDashOffset) * step;

            stRouteDiff = (da2.start - da1.start) * step;
            endRouteDiff = (da2.end - da1.end) * step;
            const divide = divideRoute(
              dataset.route,
              frameA,
              [da1.start, da1.end],
              [da2.start, da2.end]
            );

            dashDiff = divideDash(da1.lineDash, da2.lineDash, step);
            colStrokeDiff = divideColor(da1.colorstroke, da2.colorstroke, step);

            if (
              strdiff === 0 &&
              widthdiff === 0 &&
              divide["change"] === false &&
              dashDiff["change"] === false &&
              colStrokeDiff["change"] === false
            ) {
              change = false;
            }

            s = 0;
            for (let l = frameA; s < l; s++) {
              this.seq["data"][ch]["frames"].push({
                opacitystroke: stOpstroke + strdiff * s,
                colorstroke: da1.colorstroke.map((x, ind) =>
                  Math.round(x + colStrokeDiff["list"][ind] * s)
                ),
                widthStroke: stWidth + widthdiff * s,
                route: divide["list"][s],
                start: da1.start + stRouteDiff * s,
                end: da1.end + endRouteDiff * s,
                lineDash: dashDiff["st"].map(
                  (x, ind) => x + dashDiff["list"][ind] * s
                ),
                lineCap: da1.lineCap,
                lineJoin: da1.lineJoin,
                lineDashOffset: da1.lineDashOffset + lineDashOffsetDiff * s,
                change: change,
                changeRot: false,
                type: "step",
                step: s,
                total: l,
              });
            }

            if (change === false) {
              if (this.seq["data"][ch]["frames"].length > 0) {
                let ind = this.seq["data"][ch]["frames"].length - s;
                this.seq["data"][ch]["frames"][ind].change = true;
              }
            }

            break;
        }
      }
    }
    this.calcWhole();
    return true;
  }

  calcWhole(extendSeq = false) {
    let duration, step, frameA;
    let totalF = 0;

    let beg = chartT.options.scales.x.min;
    let end =
      chartT.options.scales.x.max + chartT.options.plugins.dragData.offsetmaxX;
    let layset;
    let frameCopy;
    for (let key of Object.keys(this.seq["data"])) {
      layset = this.seq["data"][key];
      if (layset["frames"].length == 0) continue;
      if (beg < layset["start"]) {
        frameCopy = JSON.parse(JSON.stringify(layset["frames"][0]));

        frameCopy.change = false;

        frameCopy.type = "copy";

        duration = layset["start"] - beg;
        frameA = Math.round(duration * this.frame_s);
        duration = frameA / this.frame_s;

        frameA = layset["start"] - beg;

        frameCopy.step = 0;
        frameCopy.total = frameA;

        for (let s = 0, l = frameA; s < l; s++) {
          layset["frames"].unshift(frameCopy);
        }

        layset["start"] = beg;
      }
      if (end > layset["end"]) {
        frameCopy = JSON.parse(
          JSON.stringify(layset["frames"][layset["frames"].length - 1])
        );
        frameCopy.change = false;

        frameCopy.type = "copy";

        duration = end - layset["end"];
        frameA = Math.round(duration * this.frame_s);
        duration = frameA / this.frame_s;

        frameA = end - layset["end"];

        frameCopy.step = layset["frames"].length - 1;
        frameCopy.total = frameA;

        for (let s = 0, l = frameA; s < l; s++) {
          layset["frames"].push(frameCopy);
        }

        layset["end"] = end;
      }
    }

    for (let key of Object.keys(this.seq["data"])) {
      layset = this.seq["data"][key];
      if (layset["frames"].length < totalF) {
        frameCopy = JSON.parse(
          JSON.stringify(layset["frames"][layset["frames"].length - 1])
        );
        frameCopy.change = false;
        frameCopy.type = "copy";

        frameA = totalF - layset["frames"].length;

        frameCopy.step = layset["frames"].length - 1;
        frameCopy.total = frameA;

        for (let s = 0, l = frameA; s < l; s++) {
          layset["frames"].push(frameCopy);
        }

        layset["end"] += frameA;
      } else if (layset["frames"].length > totalF)
        totalF = layset["frames"].length;
    }

    if (!extendSeq) {
      this.seq["length"] = totalF;
      this.seq["frames"] = new Array(totalF).fill(null);
    } else {
      totalF = end + 1;
      if (Object.keys(this.seq["data"]).length === 0) totalF = 0;

      this.seq["frames"].length = totalF;
      this.seq["frames"].fill(null, this.seq["length"]);
      this.seq["length"] = totalF;
    }
  }

  async draw(ind, num, state = "multi") {
    if (!this.play && this.playN !== num) return;
    previewContext.clearRect(0, 0, this.previewRes[0], this.previewRes[1]);
    this.playPos.preFrame = ind;
    if (this.seq["frames"][ind]) {
      previewContext.drawImage(this.seq["frames"][ind], 0, 0);
    }
    if (state === "single") this.playPos.preFrame = null;
    this.progressBarDraw(chartT);
    if (this.seq["frames"].length - 1 === this.playPos.preFrame) {
      this.playPos.preFrame = null;
      this.timeoutArray.push(
        setTimeout(() => {
          this.progressBarDraw(chartT);
          this.cancelPreview();
        }, 100)
      );
    }
  }

  changePlayButton(text) {
    for (let el of this.playButtons) {
      el.innerHTML = text;
    }
  }

  cancelPreview() {
    this.play = false;
    this.playN++;
    for (let time of this.timeoutArray) {
      clearTimeout(time);
    }
    this.changePlayButton("Play");
  }

  previewCheck(num, iter) {
    if (this.seq["length"] === 0 && this.playN !== num) return;
    if (
      this.imageLoad === this.seq["length"] - 1 ||
      this.imageLoad > 45 ||
      this.singleExport
    ) {
      this.play = true;
      this.changePlayButton("Pause");
      this.preview(num);
    } else {
      if (iter > 100) {
        this.timeoutArray.push(
          setTimeout(() => {
            this.previewCheck(num, iter + 1);
          }, 100)
        );
      }
    }
  }

  preview(num) {
    if (this.seq["frames"].length === 0) return;
    previewCanvas.width = this.previewRes[0];
    previewCanvas.height = this.previewRes[1];

    previewCanvas.style.width = this.previewRes[0] + "px";
    previewCanvas.style.height = this.previewRes[1] + "px";
    let cur = 0;
    if (this.playPos.preFrame) cur = this.playPos.preFrame;
    else cur = getTimeMarker();

    let lengthSeq = this.seq["length"] - cur;
    let maxSet = 60;

    let devideX = 0;
    let devideTemp = lengthSeq;
    while (devideTemp > maxSet) {
      devideTemp /= maxSet;
      devideX++;
    }

    this.drawWorker(cur, devideX + 1, lengthSeq, maxSet, num);
  }

  drawWorker(ind, deep, workersTotal, maxSet, num) {
    let curDeep = deep - 1;
    if (curDeep > 0) {
      let devideTemp = workersTotal / maxSet;
      let totalX = Math.pow(maxSet, curDeep);
      let quotient = Math.floor(devideTemp);
      let remainder = devideTemp - quotient;

      let workers = new Array(quotient).fill(totalX);
      if (remainder) workers.push(workersTotal - totalX * quotient);

      for (let i = 0, d = workers.length; i < d; i++) {
        this.timeoutArray.push(
          setTimeout(() => {
            this.drawWorker(ind + i * totalX, curDeep, workers[i], maxSet, num);
          }, this.s_frame * i * totalX)
        );
      }
    } else {
      for (let i = 0; i < workersTotal; i++) {
        this.timeoutArray.push(
          setTimeout(() => {
            this.draw(i + ind, num);
          }, this.s_frame * i)
        );
      }
    }
  }

  progressBarDraw(chart) {
    progressPre(chart);
  }

  renderStartMarker(mode = "render") {
    this.zipIndex = {};

    this.exportN++;
    const num = this.exportN;
    const rootN = `root_${num}`;

    this.zipIndex[rootN] = new zip.fs.FS();
    this.zipIndex[`${rootN}-merge`] =
      this.zipIndex[rootN].addDirectory("merge").id;

    if (mode === "render_all") {
      for (let d = 1, l = chartT.data.datasets.length; d < l; d++) {
        if (chartT.data.datasets[d].use === false) continue;

        let name = chartDict["indexToName"][String(d)];
        this.zipIndex[`${rootN}-${name}`] =
          this.zipIndex[rootN].addDirectory(name).id;
      }
    }

    if (this.play) this.cancelPreview();

    if (!this.calcSeq()) {
      removeFog();
      return;
    }
    this.exportSeq(mode, num, 0, "singleSeq");
  }

  previewStartMarker(opt = "") {
    this.exportStart("preview", getTimeMarker(), opt);
  }

  exportStart(mode, i, opt = "") {
    if (this.exportTimeout) clearTimeout(this.exportTimeout);
    if (this.waitDrawInterval) clearInterval(this.waitDrawInterval);
    this.exportTimeout = setTimeout(() => {
      this.exportN++;
      if (this.exportN >= 1000000) this.exportN = 0;
      this.exportSeq(mode, this.exportN, i, opt);

      let iter = 0;
      if (mode === "preview") {
        this.waitDrawInterval = setInterval(() => {
          if (this.seq["frames"].length === 0 || iter > 100) {
            clearInterval(this.waitDrawInterval);
          } else if (this.seq["frames"][i]) {
            clearInterval(this.waitDrawInterval);
            if (!this.play) {
              previewCanvas.width = this.previewRes[0];
              previewCanvas.height = this.previewRes[1];
              this.draw(i, this.playN, "single");
            }
          }
          iter++;
        }, 50);
      }
    }, 150);
  }

  exportNew() {
    if (this.exportNewTimeout) clearTimeout(this.exportNewTimeout);
    this.exportNewTimeout = setTimeout(() => {
      if (this.play) this.cancelPreview();
      this.exportN++;
      this.calcSeq();
      this.previewStartMarker();
    }, 1500);
  }

  exportResize() {
    if (this.calcwholeTimeout) clearTimeout(this.calcwholeTimeout);
    this.calcwholeTimeout = setTimeout(() => {
      this.calcWhole(true);
      this.exportStart("preview", getTimeMarker(), "");
    }, 500);
  }

  async exportSeq(mode, num, ind = 0, opt = "") {
    if (this.exportN !== num) return;

    const sizeMap = map.getSize();
    const mapRen = document.querySelector(".rendermap");
    mapRen.width = this.renderRes[0] + "px";
    mapRen.height = this.renderRes[1] + "px";
    mapRen.style.width = this.renderRes[0] + "px";
    mapRen.style.height = this.renderRes[1] + "px";
    mapRender.setSize(this.renderRes);

    let resSetting = mode === "preview" ? this.previewRes : this.renderRes;

    this.scaleRes = Math.min(
      this.renderRes[0] / resSetting[0],
      this.renderRes[1] / resSetting[1]
    );

    this.scaleView = Math.min(
      this.renderRes[0] / sizeMap[0],
      this.renderRes[1] / sizeMap[1]
    );

    if (this.seq["length"] == 0) return false;
    let keys = Object.keys(this.seq["data"]);
    let keysLength = keys.length;
    let key, cur;
    let change = false,
      beginCopy = null,
      exportOpt = {},
      mes;
    let n = this.seq["length"];

    let i = ind;
    let singleFrame = this.singleExport;
    if (opt === "singleSeq") singleFrame = false;

    if (singleFrame && n > i) {
      n = i + 1;

      for (let z = 0, d = keysLength; z < d; z++) {
        if (this.seq["data"][keys[z]]["frames"][i].change === true) {
          change = true;
        }
      }
      if (change === false) {
        let copyList = new Array(keysLength);
        for (let z = 0; z < keysLength; z++) copyList[z] = new Array(0);

        for (let z = 0, d = keysLength; z < d; z++) {
          key = keys[z];
          cur = this.seq["data"][key]["frames"][i];
          if (cur.type === "step") {
            let b_st = i - cur.step;
            let l_st = b_st + cur.total;
            for (; b_st < l_st; b_st++) {
              if (this.seq["frames"][b_st]) {
                copyList[z].push(b_st);
              }
            }
          } else if (cur.type === "copy") {
            let b_st = cur.step;
            let l_st = b_st + cur.total;
            for (; b_st < l_st; b_st++) {
              if (this.seq["frames"][b_st]) {
                copyList[z].push(b_st);
              }
            }
          }
        }
        let ctemp = null,
          count;
        if (keysLength > 0) {
          for (let z1 of copyList[0]) {
            count = 1;
            for (let d2 = 1; d2 < keysLength; d2++) {
              for (let z2 of copyList[d2]) {
                if (z2 > z1) break;
                if (z1 === z2) {
                  count++;
                  break;
                }
              }
            }
            if (count === keysLength) {
              ctemp = z1;
              break;
            }
          }
        }
        if (ctemp !== null) {
          beginCopy = this.seq["frames"][ctemp];
        }
        if (beginCopy) {
          this.seq["frames"][i] = beginCopy;
          this.progressBarDraw(chartT);
        }
      }
    }
    let camera = null;
    if (this.seq["data"].hasOwnProperty("map")) {
      camera = new aeScriptCamera(
        this.renderRes,
        this.seq["data"]["map"]["frames"][0],
        this.s_frame
      );
    }

    let listLayers = [];
    for (let d = 1, l = chartT.data.datasets.length; d < l; d++) {
      if (chartT.data.datasets[d].use === false) continue;
      listLayers.push(chartDict["indexToName"][String(d)]);
    }

    let groupNum = this.queue.addGroup({
      mode: mode,
      keys: keys,
      keysLength: keysLength,
      beginCopy: beginCopy,
      mes: mes,
      listLayers: listLayers,
      camera: camera,
      num: num,
      end: n,
    });

    for (n; i < n; i++) {
      this.queue.add(groupNum, i);
    }
  }

  checkStop(num, _name) {
    if (this.exportN !== num) {
      this.queue.stop(_name);
      return true;
    }
    return false;
  }

  exportMode(v) {
    if (!v) return;
    if (v[0].mode === "preview") {
      this.exportPreview(v);
    } else if (v[0].mode === "render" || v[0].mode === "render_all") {
      this.exportRender(v);
    }
  }

  async exportPreview(v) {
    let {
      mode,
      keys,
      keysLength,
      beginCopy,
      mes,
      listLayers,
      _name,
      camera,
      num,
      end,
    } = v[0];

    let i = v[1];
    let change = false;

    if (this.checkStop(num, _name)) return;

    if (this.seq["frames"][i]) {
      this.imageLoad = i;
      this.queue.end(_name, i);
      return;
    }

    let exportOpt = {},
      changeSwitch,
      key,
      cur;
    for (let z = 0, d = keysLength; z < d; z++) {
      changeSwitch = false;

      key = keys[z];
      cur = this.seq["data"][key]["frames"][i];
      if (cur.change === true || beginCopy === null) {
        change = true;
        changeSwitch = true;
        if (this.checkStop(num, _name)) return;

        await this.functionSwitch(key, cur);
      }
      Object.assign(exportOpt, this.imageSettings(key, cur, changeSwitch));
    }

    if (this.checkStop(num, _name)) return;

    beginCopy = true;
    if (change) {
      mes = await this.export_img(mode, exportOpt);
    }

    if (mes == null || mes == undefined) {
      this.queue.next();
      return;
    }

    if (this.checkStop(num, _name)) return;

    this.seq["frames"][i] = mes;

    this.progressBarDraw(chartT);
    this.imageLoad = i;
    if (i < end - 1) {
      this.queue.change(_name, { beginCopy: beginCopy, mes: mes });
    }

    this.queue.end(_name, i);
  }

  async exportRender(v) {
    let {
      mode,
      keys,
      keysLength,
      beginCopy,
      mes,
      listLayers,
      _name,
      camera,
      num,
      end,
    } = v[0];

    let i = v[1];
    let change = false;

    if (this.checkStop(num, _name)) return;

    let exportOpt = {},
      changeSwitch,
      key,
      cur;
    for (let z = 0, d = keysLength; z < d; z++) {
      key = keys[z];
      cur = this.seq["data"][key]["frames"][i];
      if (cur.change === true || beginCopy === null) {
        change = true;
        changeSwitch = true;

        if (this.checkStop(num, _name)) return;

        await this.functionSwitch(key, cur);
      }
      Object.assign(exportOpt, this.imageSettings(key, cur, changeSwitch));
    }

    exportOpt["listLayers"] = listLayers;
    beginCopy = true;

    if (this.checkStop(num, _name)) return;

    if (change) {
      mes = await this.export_img(mode, exportOpt);
    }

    let stringName = i.toString();
    let nameImg =
      "Frame_" + ("0".repeat(4 - stringName.length) + stringName) + ".png";

    for (let x of mes) {
      if (x.data == null || x.data == undefined) {
        this.queue.next();
        return;
      }
    }

    const rootN = `root_${num}`;
    for (let x of mes) {
      if (this.checkStop(num, _name)) return;

      await this.zipIndex[rootN]
        .getById(this.zipIndex[`${rootN}-${x.name}`])
        .addHttpContent(nameImg, x.data);
    }

    this.seq["frames"][i] = true;

    this.progressBarDraw(chartT);
    this.imageLoad = i;

    if (camera) {
      if (change) {
        camera.addTime(i);
        camera.addScale(this.seq["data"]["map"]["frames"][i].zoom);
        camera.addRotation(this.seq["data"]["map"]["frames"][i].rotation);
        camera.addPosition();
      }
    }

    if (i < end - 1) {
      if (this.checkStop(num, _name)) return;

      this.queue.change(_name, { beginCopy: beginCopy, mes: mes });
      this.queue.end(_name, i);
    } else if (i === end - 1) {
      if (camera)
        this.zipIndex[rootN].addText("Trackpoints.jsx", camera.whole());

      const link = document.createElement("a");
      const blobURL = await URL.createObjectURL(
        await this.zipIndex[rootN].exportBlob()
      );
      link.href = blobURL;
      link.download = "map.zip";
      link.click();

      this.calcSeq();
      this.progressBarDraw(chartT);
      this.queue.stop(_name);

      removeFog();
      this.zipIndex = {};
    }
  }

  imageSettings(ch, opt, change) {
    let exportOpt = {};
    switch (chartDict[ch]) {
      case "map":
        if (change === true) exportOpt["zoom"] = true;

        exportOpt["attribution"] = opt["attribution"];
        if (opt["changeRot"]) exportOpt["changeRot"] = true;
        break;
      case "geo":
      case "route":
        break;
    }
    return exportOpt;
  }

  functionSwitch(ch, opt) {
    return new Promise((resolve) => {
      let ind, cm;
      let layern = chartDict[ch];

      switch (layern) {
        case "map":
          viewR.setCenter(opt["center"]);
          viewR.setZoom(opt["zoom"]);
          viewR.setRotation(opt["rotation"]);

          if (mapSourceType === "xyz") {
            if (this.xyz !== opt["xyz"]) {
              this.xyz = opt["xyz"];
              layersDict["lay"]["xyz_ren"].getSource().setUrl(opt["xyz"]);
              if (!opt["xyz"])
                layersDict["lay"]["xyz_ren"].getSource().refresh();
            }
          }
          break;

        case "geo":
          ind = parseInt(chartDict["indexToData"][ch]);
          cm = chartT.data.datasets[ind].data[0].indexRen;
          cm.setStyle(
            createStyleGeo(
              opt["color"],
              opt["opacity"],
              opt["colorstroke"],
              opt["opacitystroke"],
              opt["widthStroke"]
            )
          );
          break;

        case "route":
          ind = parseInt(chartDict["indexToData"][ch]);
          cm = chartT.data.datasets[ind].data[0].indexRen;

          cm.getGeometry().setCoordinates(opt["route"]);
          cm.setStyle(
            createStyleRoute(
              opt["colorstroke"],
              opt["opacitystroke"],
              opt["widthStroke"],
              opt["lineDash"],
              opt["lineCap"],
              opt["lineJoin"],
              opt["lineDashOffset"]
            )
          );
          break;
      }
      resolve();
    });
  }

  export_img(mode = "preview", exportOpt) {
    let _scaleRes = this.scaleRes;
    let _scaleView = this.scaleView;

    let mapCanvas,
      mapCanvasRender,
      mapCanvasFinal,
      mapFinalContext,
      mapContextRender,
      canvasBlank,
      listLayers = [],
      allLay = false,
      rot = false,
      lurl;

    if (!exportOpt.hasOwnProperty("zoom")) {
      _scaleView = 1;
    }

    if (exportOpt.hasOwnProperty("changeRot")) {
      if (exportOpt.changeRot === true) rot = true;
    }

    if (exportOpt.hasOwnProperty("listLayers")) {
      listLayers = exportOpt["listLayers"].slice(0);
    }

    return new Promise((resolve) => {
      const size = mapRender.getSize();
      viewR.setResolution(viewR.getResolution() / _scaleView);

      mapRender.once("rendercomplete", () => {
        let newW = size[0] / _scaleRes;
        let newH = size[1] / _scaleRes;

        mapCanvas = document.createElement("canvas");

        switch (mode) {
          case "render_all":
            allLay = true;
            mapCanvasRender = document.createElement("canvas");
            mapContextRender = mapCanvasRender.getContext("2d");
            mapCanvasRender.width = newW;
            mapCanvasRender.height = newH;
          case "render":
            lurl = [];
            break;
        }

        mapCanvas.width = newW;
        mapCanvas.height = newH;

        if (rot) {
          mapCanvasFinal = document.createElement("canvas");

          mapCanvasFinal.width = newW;
          mapCanvasFinal.height = newH;
          mapFinalContext = mapCanvasFinal.getContext("2d");
        }

        let mapContext = mapCanvas.getContext("2d");
        let i = 0;

        Array.prototype.forEach.call(
          document.querySelectorAll(".ol-layer-export canvas"),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
              let transform = canvas.style.transform;

              let matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(",")
                .map(Number);
              if (rot) {
                mapCanvas.width = canvas.width;
                mapCanvas.height = canvas.height;
                CanvasRenderingContext2D.prototype.setTransform.apply(
                  mapContext,
                  matrix
                );

                mapContext.drawImage(canvas, 0, 0);

                mapFinalContext.globalAlpha = mapContext.globalAlpha;
                const scaleres = 1 / _scaleRes;
                CanvasRenderingContext2D.prototype.setTransform.apply(
                  mapFinalContext,
                  [scaleres, 0, 0, scaleres, 0, 0]
                );
                mapFinalContext.drawImage(mapCanvas, 0, 0);
              } else {
                CanvasRenderingContext2D.prototype.setTransform.apply(
                  mapContext,
                  matrix
                );
                mapContext.drawImage(canvas, 0, 0, newW, newH);
              }
              if (allLay) {
                let name = "temp";
                for (let cl of canvas.parentNode.classList) {
                  if (cl.startsWith("layer_")) {
                    name = cl.replace("layer_", "");
                    break;
                  }
                }

                mapContextRender.globalAlpha = mapContext.globalAlpha;

                if (rot) {
                  lurl.push({
                    data: mapCanvasFinal.toDataURL("image/png"),
                    name: name,
                  });
                  mapContextRender.drawImage(mapCanvasFinal, 0, 0, newW, newH);
                  mapFinalContext.setTransform(1, 0, 0, 1, 0, 0);
                  mapFinalContext.clearRect(0, 0, newW, newH);
                } else {
                  lurl.push({
                    data: mapCanvas.toDataURL("image/png"),
                    name: name,
                  });
                  mapContextRender.drawImage(mapCanvas, 0, 0, newW, newH);
                }

                mapContext.setTransform(1, 0, 0, 1, 0, 0);
                mapContext.clearRect(0, 0, newW, newH);

                const ind = listLayers.indexOf(name);
                if (ind !== -1) {
                  listLayers.splice(ind, 1);
                }
              }
            }
          }
        );

        if (allLay) {
          for (let x of listLayers) {
            if (!canvasBlank) {
              canvasBlank = document.createElement("canvas");
              canvasBlank.width = newW;
              canvasBlank.height = newH;
            }
            lurl.push({
              data: canvasBlank.toDataURL("image/png"),
              name: x,
            });
          }
        }

        if (mode === "render_all") {
          mapCanvas = mapCanvasRender;
          mapContext = mapContextRender;
        } else if (rot) {
          mapCanvas = mapCanvasFinal;
          mapContext = mapFinalContext;
        }

        if (exportOpt.hasOwnProperty("attribution")) {
          let frontScale = 1;
          if (rot) frontScale = _scaleRes;
          mapContext.font = 12 * frontScale + "px serif";
          mapContext.fillText(
            exportOpt["attribution"],
            10 * frontScale,
            (newH - 10) * frontScale
          );
        }

        switch (mode) {
          case "preview":
            lurl = mapCanvas;
            break;
          case "render_all":
          case "render":
            lurl.push({
              data: mapCanvas.toDataURL("image/png"),
              name: "merge",
            });
            break;
        }
        resolve(lurl);
      });

      mapRender.renderSync();
    });
  }
}

let timeseq = new TimeSequence();

function previewClick(e) {
  timeseq.previewStartMarker("singleSeq");
}

function previewcalc(e) {
  let text = "Preview Frame: ";
  if (timeseq.singleExport) {
    timeseq.singleExport = false;
    text += "all";
    timeseq.previewStartMarker();
  } else {
    timeseq.singleExport = true;
    text += "single";
  }
  e.target.innerHTML = text;
}

function previewHandler(e) {
  if (timeseq.play) {
    timeseq.cancelPreview();
  } else {
    timeseq.previewCheck(timeseq.playN, 0);
  }
}

function removeFog() {
  container1.style["pointer-events"] = "auto";

  if (document.body.contains(greyoutDiv)) {
    document.body.removeChild(greyoutDiv);
  }
  if (container1.contains(renderHandlerDiv)) {
    container1.removeChild(renderHandlerDiv);
  }
}

function renderHandler(e) {
  renderHandlerDiv = document.createElement("div");
  renderHandlerDiv.className = "popup-sel";
  const frameInnerText = document.createElement("span");
  frameInnerText.innerHTML = "Export layers:";

  const buttRenAll = document.createElement("div");
  buttRenAll.innerHTML = "Merge and all layers";
  buttRenAll.className = "mainButton";

  const buttRenMerge = document.createElement("div");
  buttRenMerge.innerHTML = "Merge";
  buttRenMerge.className = "mainButton";

  renderHandlerDiv.appendChild(frameInnerText);
  renderHandlerDiv.appendChild(buttRenAll);
  renderHandlerDiv.appendChild(buttRenMerge);
  container1.appendChild(renderHandlerDiv);

  container1.style["pointer-events"] = "none";
  greyoutDiv = document.createElement("div");
  greyoutDiv.className = "greyout";
  document.body.appendChild(greyoutDiv);

  const closeButton = document.createElement("button");
  closeButton.className = "closeButton";

  renderHandlerDiv.appendChild(closeButton);

  new moveEl(renderHandlerDiv);

  this.waitFrame = function (opt) {
    frameInnerText.innerHTML = "Rendering:";
    renderHandlerDiv.removeChild(closeButton);
    renderHandlerDiv.removeChild(buttRenAll);
    renderHandlerDiv.removeChild(buttRenMerge);

    const buttRestart = document.createElement("div");
    buttRestart.innerHTML = "Restart";
    buttRestart.className = "mainButton";

    const buttAbort = document.createElement("div");
    buttAbort.innerHTML = "Abort";
    buttAbort.className = "mainButton";

    renderHandlerDiv.appendChild(buttRestart);
    renderHandlerDiv.appendChild(buttAbort);

    buttRestart.onclick = () => {
      timeseq.renderStartMarker(opt);
    };

    buttAbort.onclick = () => {
      removeFog();
      timeseq.exportNew();
    };

    timeseq.renderStartMarker(opt);
  };

  buttRenAll.onclick = (el) => {
    const opt = "render_all";
    this.waitFrame(opt);
  };

  buttRenMerge.onclick = (el) => {
    const opt = "render";
    this.waitFrame(opt);
  };

  closeButton.onclick = (el) => {
    removeFog();
  };
}

function createStyleTableMap(sel = 0) {
  const rgbSelcol = [65, 145, 134];
  const rgbSelstroke = [65, 145, 134];

  const rgbcol = [82, 64, 133];
  const rgbstroke = [82, 64, 133];

  const rgbClickcol = [109, 171, 212];
  const rgbClickstroke = [109, 171, 212];

  let widthStroke = sel == 0 ? 1 : 2;
  let strokeC =
    sel == 0
      ? `rgba(${rgbstroke.toString()}, ${1})`
      : sel == 1
      ? `rgba(${rgbSelstroke.toString()}, ${1})`
      : sel == 2
      ? `rgba(${rgbClickstroke.toString()}, ${1})`
      : false;

  let newC =
    sel == 0
      ? `rgba(${rgbcol.toString()}, ${0.5})`
      : sel == 1
      ? `rgba(${rgbSelcol.toString()}, ${0.5})`
      : sel == 2
      ? `rgba(${rgbClickcol.toString()}, ${0.5})`
      : false;

  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeC,
      width: widthStroke,
    }),
    fill: new ol.style.Fill({
      color: newC,
    }),
  });
}

function createStyleGeo(
  colors = [255, 0, 0],
  opacity = 1,
  colstroke = [0, 0, 0],
  opacitystroke = 1,
  widthStroke = 1
) {
  let newC = `rgba(${colors[0]},${colors[1]},${colors[2]}, ${opacity} )`;
  let strokeC = `rgba(${colstroke[0]},${colstroke[1]},${colstroke[2]}, ${opacitystroke} )`;
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeC,
      width: widthStroke,
    }),
    fill: new ol.style.Fill({
      color: newC,
    }),
  });
}

function createStyleRoute(
  colstroke = [0, 0, 0],
  opacitystroke = 1,
  widthStroke = 1,
  lineDash = null,
  lineCap = "round",
  lineJoin = "round",
  lineDashOffset = 0
) {
  let strokeC = `rgba(${colstroke[0]},${colstroke[1]},${colstroke[2]}, ${opacitystroke} )`;
  return new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: strokeC,
      lineCap: lineCap,
      lineJoin: lineJoin,
      lineDashOffset: lineDashOffset,
      lineDash: lineDash,
      width: widthStroke,
    }),
  });
}

function createStyle(text_string, border = "", trans = false) {
  let borderstyle = border === "sel" ? "blue" : "white";
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: "black",
      }),
      stroke: new ol.style.Stroke({
        color: borderstyle,
        width: 2,
      }),
    }),

    text: new ol.style.Text({
      text: text_string,
      offsetX: 0,
      offsetY: -10,
      font: `${14}px sans-serif`,
      fill: new ol.style.Fill({
        color: "red",
      }),
    }),
  });
}
let map = new ol.Map({
  interactions: ol.interaction.defaults(),
  target: "map",
  controls: ol.control
    .defaults({
      attribution: false,
    })
    .extend([
      new ol.control.Attribution({
        collapsible: false,
      }),
    ]),
  layers: [],
  view: viewT,
});
map.addControl(new ol.control.ZoomSlider());

let mapRender = new ol.Map({
  target: "rendermap",
  controls: ol.control
    .defaults({
      attribution: false,
    })
    .extend([
      new ol.control.Attribution({
        collapsible: false,
      }),
    ]),
  layers: [],
  view: viewR,
});

map.on("postrender", () => {
  zoomInput.value = viewT.getZoom();
  let tempcent = ol.proj.toLonLat(viewT.getCenter());
  xInput.value = tempcent[0];
  yInput.value = tempcent[1];
  rotationInput.value = viewT.getRotation();
});

function toCenter(center) {
  let xvalue = Math.max(Math.min(center[0], 80), -180);
  let yvalue = Math.max(Math.min(center[1], 80), -180);
  return ol.proj.fromLonLat([xvalue, yvalue]);
}

function changeInput(e) {
  if (e.type == "keyup") {
    if (e.keyCode === 13) {
      let tempcent = toCenter([xInput.value, yInput.value]);
      viewT.setCenter(tempcent);
      viewT.setZoom(zoomInput.value);
      viewT.setRotation(rotationInput.value);
    }
  }
}

function getTimeMarker() {
  return Number.isInteger(chartT.data.datasets[0].data[0].x)
    ? chartT.data.datasets[0].data[0].x
    : 0;
}

function checkTimeMarker() {
  let offsetX = chartT.options.plugins.dragData.offsetmaxX;
  if (
    chartT.data.datasets[0].data[0].x - offsetX >
    chartT.options.scales.x.max
  ) {
    chartT.data.datasets[0].data[0].x = chartT.options.scales.x.max + offsetX;
    chartT.data.datasets[0].data[1].x = chartT.options.scales.x.max + offsetX;
  }
}

map.on("click", function (e) {
  map.forEachLayerAtPixel(e.pixel, function (sel) {});
  map.forEachFeatureAtPixel(
    e.pixel,
    function (sel) {
      let layerSel = sel.get("layer");
      if (layerSel === "map") {
        let data = sel.get("chart");
        let indSel = data.cur;

        let ch = sel.get("title");
        let ind = parseInt(chartDict["indexToData"][ch]);
        let nameSel = sel.get("name");

        switchHighlight([ind, indSel]);
      } else if (layerSel === "bez") {
        deselectChar();
        layersDict["lay"]["sel"].getSource().addFeature(sel);
        sel.setStyle(createStyleMid(true));
      } else if (layerSel === "track") {
        deselectChar();
        layersDict["lay"]["sel"].getSource().addFeature(sel);
        if (sel.get("name") === "track") {
          sel.setStyle(createStyleTrack(true));
        } else if (sel.get("name") === "route") {
          sel.setStyle(createStyleRouteMarker(true));
        }
      }
    },
    {
      layerFilter: function (layer) {
        return (
          layer.get("title") === "map" ||
          layer.get("title") === "bez" ||
          layer.get("title") === "track"
        );
      },
    }
  );
});

function selectChar(datasetIndex, index) {
  if (datasetIndex <= 0) return;
  let indSel = chartT.data.datasets[datasetIndex].data[index].indexmap;

  if (indSel == null || indSel == undefined) return;

  switchHighlight([datasetIndex, index]);
}

function newStyle(cm, data, key) {
  switch (key) {
    case "geo":
      cm.setStyle(
        createStyleGeo(
          data["color"],
          data["opacity"],
          data["colorstroke"],
          data["opacitystroke"],
          data["widthStroke"]
        )
      );
      break;

    case "route":
      cm.setStyle(
        createStyleRoute(
          data["colorstroke"],
          data["opacitystroke"],
          data["widthStroke"],
          data["lineDash"],
          data["lineCap"],
          data["lineJoin"],
          data["lineDashOffset"]
        )
      );
      break;
  }
}

function inputHandler(e) {
  if (typeof e.keyCode !== "undefined") {
    if (e.keyCode !== 13) return;
  }

  let data = chartT.data.datasets[curSelChar[0]].data[curSelChar[1]];
  let cm = data.indexmap;
  let num, org, val;

  const name = e.target.name.split("_");

  switch (name[0]) {
    case "x":
      if (isNaN(parseInt(e.target.value))) break;

      num = Math.max(parseInt(e.target.value), 0);
      let offsetX = chartT.options.plugins.dragData.offsetmaxX;
      if (num > chartT.options.scales.x.max + offsetX) framesX(num - offsetX);
      data.x = num;
      rearrangeData();
      moveMarkerLine(data);
      break;

    case "zoom":
      if (isNaN(parseInt(e.target.value))) break;
      num = parseFloat(e.target.value);
      num = Math.max(Math.min(num, viewT.getMaxZoom()), viewT.getMinZoom());
      data[name[0]] = num;

      moveMarkerLine(data);
      viewT.setZoom(num);
      break;

    case "lon":
      if (isNaN(parseInt(e.target.value))) break;
      num = toCenter([parseFloat(e.target.value), 0])[0];

      org = data.center.slice(0);
      org[0] = num;
      data["center"] = org;
      cm.setGeometry(new ol.geom.Point(org));

      viewT.setCenter(org);
      moveMarkerLine(data);
      break;

    case "lat":
      if (isNaN(parseInt(e.target.value))) break;
      num = toCenter([0, parseFloat(e.target.value)])[1];
      org = data.center;
      org[1] = num;
      data["center"] = org;
      cm.setGeometry(new ol.geom.Point(org));

      viewT.setCenter(org);
      moveMarkerLine(data);
      break;

    case "xyz":
      data.xyz = e.target.value;
      layersDict["lay"]["xyz"].getSource().setUrl(e.target.value);
      let att = attributionText(e.target.value);
      setAttributionText(att);
      data.attribution = att;
      if (!e.target.value) layersDict["lay"]["xyz"].getSource().refresh();
      switchHighlight();
      break;

    case "attribution":
      data.attribution = e.target.value;
      setAttributionText(e.target.value);
      break;

    case "color":
      num = hextoRgb(e.target.value);
      if (num) {
        data[name[0]] = num;
        newStyle(cm, data, "geo");
      }
      break;

    case "colorstroke":
      num = hextoRgb(e.target.value);
      if (num) {
        data[name[0]] = num;

        newStyle(cm, data, name[1]);
      }
      break;

    case "lineDashOffset":
    case "opacity":
      if (isNaN(parseInt(e.target.value))) break;
      data[name[0]] = parseFloat(e.target.value);
      newStyle(cm, data, name[1]);
      break;

    case "widthStroke":
    case "opacitystroke":
      if (isNaN(parseInt(e.target.value))) break;
      data[name[0]] = parseFloat(e.target.value);

      newStyle(cm, data, name[1]);

      break;

    case "mapZ":
      if (isNaN(parseInt(e.target.value))) break;
      val = parseInt(e.target.value);
      chartT.data.datasets[curSelChar[0]].mapZ = val;
      data.xyz = val;
      let nameL = data.title;
      layersDict["lay"][nameL].setZIndex(val);
      layersDict["lay"][nameL + "_ren"].setZIndex(val);

      if (layersDict["lay"]["line"].getZIndex() <= val) {
        setZlayers(val + 1);
      }
      break;

    case "trim":
      if (isNaN(parseInt(e.target.value))) break;
      val = Math.min(Math.max(parseInt(e.target.value), 0), 100);
      e.target.value = val;

      data[name[1]] = val;
      break;
    case "lineSelect":
      data[name[1]] = e.target.value;
      newStyle(cm, data, "route");
      break;

    case "lineDash":
      try {
        val = JSON.parse(`[${e.target.value}]`);
        let allN = false;

        if (Array.isArray(val)) {
          allN = true;
          for (let x of val) {
            if (isNaN(x)) {
              allN = false;
              break;
            }
          }
        }

        if (allN) {
          data[name[0]] = val;
          newStyle(cm, data, "route");
        } else {
          break;
        }
      } catch (error) {
        break;
      }

      break;

    default:
      if (isNaN(parseInt(e.target.value))) break;
      data[name[0]] = parseFloat(e.target.value);

      break;
  }
}

function createInputDom(text, value, nameKey = "") {
  let wrapEl = document.createElement("div");
  let spanEl = document.createElement("span");
  let inpEl = document.createElement("input");

  spanEl.innerHTML = text;

  let eventTrigger = "keyup";

  const name = nameKey.split("_");

  switch (name[0]) {
    case "attribution":
      spanEl.className = "tooltip";
      const tooltip = document.createElement("span");
      tooltip.className = "tooltip-text";
      tooltip.innerHTML =
        "Check the provider for the actual attribution and terms";
      spanEl.appendChild(tooltip);
    case "xyz":
      inpEl.value = value;
      inpEl.setAttribute("list", "xyz_urls");
      let datalist = document.createElement("datalist");
      datalist.id = "xyz_urls";
      for (let host of XYZURLS) {
        for (let x of host.list) {
          const opt = document.createElement("option");
          opt.value = host.url(x);
          datalist.appendChild(opt);
        }
      }
      wrapEl.appendChild(datalist);
      break;

    case "lineDash":
      inpEl.value = value === null ? [0, 0].toString() : value.toString();
      break;

    case "lineSelect":
      inpEl = document.createElement("select");
      eventTrigger = "change";

      const lineCapList =
        name[1] === "lineCap"
          ? ["butt", "round", "square"]
          : name[1] === "lineJoin"
          ? ["bevel", "round", "miter"]
          : [];

      for (let x of lineCapList) {
        const opt = document.createElement("option");
        if (value === x) opt.selected = "selected";

        opt.value = x;
        opt.innerHTML = x;
        inpEl.appendChild(opt);
      }
      break;

    case "colorstroke":
    case "color":
      inpEl.type = "color";
      inpEl.value = rgbtoHex(value);
      eventTrigger = "change";
      break;

    default:
      inpEl.type = "number";
      inpEl.value = value;
      break;
  }

  wrapEl.appendChild(spanEl);
  wrapEl.appendChild(inpEl);

  valuePannel.appendChild(wrapEl);

  inpEl.name = nameKey;
  inpEl.addEventListener(eventTrigger, inputHandler);

  wrapEl.className = "input-wrapper";
}

function switchHighlight(newH = null) {
  let cur = curSelChar.slice(0);
  deselectChar();
  curSelChar = newH ? newH : cur;
  highlightSel();
}

function highlightSel() {
  if (curSelChar.length === 0) return;

  let cdata = curSelChar;
  let data = chartT.data.datasets[curSelChar[0]].data[curSelChar[1]];
  let cm = data.indexmap;
  cm.set("curstyle", "sel");
  let lay = data["layer"];

  switch (lay) {
    case "map":
      layersDict["lay"]["sel"].getSource().addFeature(cm);

      viewT.setCenter(data.center);
      viewT.setZoom(data.zoom);
      viewT.setRotation(data.rotation);
      cm.setStyle(createStyle(`${data.step}`, "sel"));

      setAttributionText(data.attribution);

      if (mapSourceType === "xyz") {
        if (layersDict["lay"]["xyz"].getSource().get("url") !== data.xyz) {
          layersDict["lay"]["xyz"].getSource().setUrl(data.xyz);
          if (!data.xyz) layersDict["lay"]["xyz"].getSource().refresh();
        }
      }

      createInputDom("Frame", data.x, "x");
      createInputDom("Zoom", data["zoom"], "zoom");
      createInputDom("Lon", ol.proj.toLonLat(data["center"])[0], "lon");
      createInputDom("Lat", ol.proj.toLonLat(data["center"])[1], "lat");
      createInputDom("Rotation", data["rotation"], "rotation");
      if (mapSourceType === "xyz") createInputDom("Tile url", data.xyz, "xyz");
      createInputDom("Attribution", data.attribution, "attribution");
      break;

    case "geo":
      newStyle(cm, data, "geo");

      createInputDom("Frame", data.x, "x");
      createInputDom("Opacity", data["opacity"], "opacity_geo");
      createInputDom("Color", data["color"], "color");
      createInputDom("Stroke color", data["colorstroke"], "colorstroke_geo");
      createInputDom(
        "Stroke opacity",
        data["opacitystroke"],
        "opacitystroke_geo"
      );
      createInputDom("Stroke width", data["widthStroke"], "widthStroke_geo");
      createInputDom(
        "zIndex",
        chartT.data.datasets[curSelChar[0]].mapZ,
        "mapZ"
      );
      break;

    case "route":
      cm.setStyle(
        createStyleRoute(
          data["colorstroke"],
          data["opacitystroke"],
          data["widthStroke"],
          data["lineDash"],
          data["lineCap"],
          data["lineJoin"],
          data["lineDashOffset"]
        )
      );
      createInputDom("Frame", data.x, "x");
      createInputDom("Stroke color", data["colorstroke"], "colorstroke_route");
      createInputDom(
        "Stroke opacity",
        data["opacitystroke"],
        "opacitystroke_route"
      );
      createInputDom("Stroke width", data["widthStroke"], "widthStroke_route");

      createInputDom("Trim start", data["start"], "trim_start");
      createInputDom("Trim end", data["end"], "trim_end");

      createInputDom("Line dash", data["lineDash"], "lineDash");
      createInputDom("Line cap", data["lineCap"], "lineSelect_lineCap");
      createInputDom("Line join", data["lineJoin"], "lineSelect_lineJoin");
      createInputDom(
        "Line DashOffset",
        data["lineDashOffset"],
        "lineDashOffset_route"
      );

      createInputDom(
        "zIndex",
        chartT.data.datasets[curSelChar[0]].mapZ,
        "mapZ"
      );
      break;
  }

  rearrangeData();
}

function deselectChar() {
  valuePannel.replaceChildren();

  for (let fea of layersDict["lay"]["sel"].getSource().getFeatures()) {
    if (fea.get("layer") === "bez") {
      fea.setStyle(createStyleMid(false));
    }
    if (fea.get("layer") === "track") {
      if (fea.get("name") === "track") {
        fea.setStyle(createStyleTrack(false));
      } else if (fea.get("name") === "route") {
        fea.setStyle(createStyleRouteMarker(false));
      }
    }
  }
  layersDict["lay"]["sel"].getSource().clear();

  if (curSelChar.length != 0) {
    let data = chartT.data.datasets[curSelChar[0]].data[curSelChar[1]];
    let cm = data.indexmap;
    cm.set("curstyle", "none");
    if (data.layer === "map")
      cm.setStyle(createStyle(`${data.step}`, cm.get("curstyle")));
  }
  curSelChar = [];
}

function addMarker() {
  let ch = "map";
  let indexM = markerDict[ch].length;

  let newFeature = new ol.Feature({
    geometry: new ol.geom.Point(viewT.getCenter()),
    name: `${ch}_${indexM}`,
    title: ch,
    layer: ch,
    step: indexM,
    curstyle: "none",
    chart: null,
  });
  markerDict[ch].push(newFeature);
  let data = addKeyframe(1, 1, newFeature, {
    name: `${ch}_${indexM}`,
    title: ch,
    layer: ch,
    xyz: defaultLay[chartDict[ch]]["xyz"],
    attribution: attributionText(defaultLay[chartDict[ch]]["xyz"]),
    curstyle: "none",
    zoom: viewT.getZoom(),
    center: viewT.getCenter(),
    rotation: viewT.getRotation(),
    lines: { pre: null, next: null },
    bez: { point: null, lines: null },
  });

  if (data.pre !== null) {
    let org = chartT.data.datasets[1].data[data.pre];
    for (let op of Object.keys(defaultLay[chartDict[ch]])) {
      data[op] = JSON.parse(JSON.stringify(org[op]));
    }
  }

  newFeature.setStyle(createStyle(`${newFeature.get("step")}`));
  newFeature.set("chart", data);
  layersDict["lay"]["map"].getSource().addFeatures([newFeature]);
}

function addKeyframe(index, yvalue, feature, opt = null, ren = null) {
  deselectChar();
  let xpos = getTimeMarker();

  let temp = {
    x: getTimeMarker(),
    y: yvalue,
    indexmap: feature,
    indexRen: ren,
    pre: null,
    next: null,
    real: null,
    step: null,
    cur: chartT.data.datasets[index].data.length,
  };

  if (opt) {
    Object.assign(temp, { ...opt });
  }

  let data = {};
  data = addSetGet(data, temp);

  chartT.data.datasets[index].data.push(data);
  rearrangeData();

  return data;
}

function addFromPanel(ch) {
  switch (chartDict[ch]) {
    case "map":
      addMarker();
      break;
    case "route":
    case "geo":
      let index = parseInt(chartDict["indexToData"][ch]);
      let last_x = 0,
        last_xInd = 0;
      let timepos = getTimeMarker();
      for (let da of chartT.data.datasets[index].data) {
        if (da.x > last_x && da.x <= timepos) {
          last_x = da.x;
          last_xInd = da.cur;
        }
      }
      let org = chartT.data.datasets[index].data[last_xInd];
      let fea = org.indexmap;
      let data = addKeyframe(
        index,
        org.y,
        fea,
        defaultLay[chartDict[ch]],
        org.indexRen
      );

      let changes = {};
      for (let op of Object.keys(defaultLay[chartDict[ch]])) {
        try {
          if (timeseq.seq.data[ch].frames[data.x].hasOwnProperty(op)) {
            changes[op] = JSON.parse(
              JSON.stringify(timeseq.seq.data[ch].frames[data.x][op])
            );
          } else {
            throw true;
          }
        } catch (error) {
          changes[op] = JSON.parse(JSON.stringify(org[op]));
        }
      }

      for (let op in changes) {
        data[op] = changes[op];
      }

      break;
  }
}

function moveMarker() {
  if (curSelChar.length === 0) return;

  let data = chartT.data.datasets[curSelChar[0]].data[curSelChar[1]];
  let cm = data.indexmap;
  cm.getGeometry().setCoordinates(viewT.getCenter());

  data["center"] = viewT.getCenter();
  data["zoom"] = viewT.getZoom();
  data["rotation"] = viewT.getRotation();

  moveMarkerLine(data);
}

function moveMarkerLine(data) {
  if (data.lines.pre) setLine(data.lines.pre);
  if (data.lines.next) setLine(data.lines.next);
  switchHighlight();
}

function translatingHandler(e) {
  for (let fea of e.features.R) {
    let layer = fea.get("layer");
    if (layer === "map") {
      let data = fea.get("chart");
      for (let key of Object.keys(data.lines)) {
        if (data.lines[key] !== null) setLine(data.lines[key]);
      }
    } else if (layer === "bez") {
      bezPoint(fea);
    } else if (layer === "track") {
      if (fea.get("name") === "track") {
        moveTrackpoint(fea);
      } else if (fea.get("name") === "route") {
        if (routeframeDiv) {
          routeframeDiv.moveMarker(fea);
        }
      }
    }
  }
}

function translateendHandler(e) {
  e.features.forEach((sel) => {
    let layer = sel.get("layer");
    if (layer === "map") {
      let data = sel.get("chart");
      data["center"] = sel.getGeometry().getCoordinates();
    } else if (layer === "bez") {
    }
  });

  switchHighlight();
}

function deleteMarker(e) {
  if (e.type == "keyup") {
    if (e.keyCode != 46) return;
  }

  deleteHandler();
}

function deleteHandler() {
  for (let fea of layersDict["lay"]["sel"].getSource().getFeatures()) {
    if (fea.get("layer") === "bez") {
      removeMid(fea.get("parent"));
      setLine(fea.get("parent"));
    } else if (fea.get("layer") === "track") {
      if (fea.get("name") === "track") {
        deleteTrackPoint(fea);
      } else if (fea.get("name") === "route") {
        if (routeframeDiv) {
          deselectChar();
          routeframeDiv.delInputFromFeature(fea);
        }
      }
    }
  }

  if (curSelChar.length === 0) return;

  let data = chartT.data.datasets[curSelChar[0]].data[curSelChar[1]];
  let cm = data.indexmap;

  let curpos = data.y;

  cm.set("chart", null);
  if (data.layer === "map") {
    for (let lineK of Object.keys(data.lines)) {
      if (data.lines[lineK] !== null) {
        let allP = data.lines[lineK].get("parent");
        let rem = null;
        for (let p = 0, n = allP.length; p < n; p++) {
          if (allP[p].cur === data.cur) {
            rem = p;
            break;
          }
        }
        if (rem !== null) {
          delete allP[rem];
        }
      }
    }
  }
  chartT.data.datasets[curSelChar[0]].data.splice(curSelChar[1], 1);
  let ch = chartDict["indexToName"][curSelChar[0]];

  if (chartT.data.datasets[curSelChar[0]].data.length === 0 && ch !== "map") {
    layersDict["lay"][ch].getSource().removeFeature(cm);
    let cmR = data.indexRen;
    layersDict["lay"][ch + "_ren"].getSource().removeFeature(cmR);

    layersDict["chart"]["size"]--;
    chartT.data.datasets[curSelChar[0]].use = false;

    let dataset, da;
    for (let i = 0, n = chartT.data.datasets.length; i < n; i++) {
      if (i < 2) continue;
      dataset = chartT.data.datasets[i];
      for (let z = 0, d = dataset.data.length; z < d; z++) {
        da = dataset.data[z];
        if (da.y < curpos) da.y = da.y + 2;
      }
    }

    chartT.options.scales.y.min += 2;
    chartT.data.datasets[0].data[0].y = chartT.options.scales.y.min;

    canvCon.style.height = `${(orgCanvHeight -= chartSizeDict["add"])}px`;
  } else if (ch === "map") {
    layersDict["lay"][ch].getSource().removeFeature(cm);
  }

  curSel = [null];
  rearrangeData(curSelChar[0]);
  curSelChar = [];
  deselectChar();
  chartT.resize();
  timeseq.exportNew();
}

function createStyleMid(sel = false) {
  let col = "red";
  if (sel) col = "blue";
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({
        color: col,
      }),
    }),
  });
}

function createStyleTrack(sel = false) {
  let col = "purple";
  if (sel) col = "blue";
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 4,
      fill: new ol.style.Fill({
        color: col,
      }),
    }),
  });
}

function createStyleRouteMarker(sel = false) {
  let col = "green";
  if (sel) col = "blue";
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: col,
      }),
    }),
  });
}

function addLineMid(points) {
  let geomid = [
    (points[0][0] + points[1][0]) / 2,
    (points[0][1] + points[1][1]) / 2,
  ];

  let mid = new ol.Feature({
    geometry: new ol.geom.Point(geomid),
    layer: "bez",
    name: "mid",
    parent: null,
    points: [],
    bez: null,
  });

  mid.setStyle(createStyleMid());

  return mid;
}

function addLine(points, dataP) {
  let line = new ol.geom.LineString(points);

  let mid = null;
  let dist = dataP[0].x - dataP[1].x;
  if (dist > 1 || dist < -1) {
    mid = addLineMid(points);
  }

  let fea = new ol.Feature({
    geometry: line,
    name:
      `line_${dataP[0].step}_` +
      points[0][0] +
      points[0][1] +
      points[1][0] +
      points[1][1],
    mid: mid,
    parent: dataP,
    layer: "line",
  });
  fea.setStyle(
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#ffcc33",
        width: 2,
        lineDash: [4, 4],
      }),
    })
  );

  layersDict["lay"]["line"].getSource().addFeature(fea);
  if (mid) {
    mid.set("parent", fea);
    layersDict["lay"]["bez"]["point"].getSource().addFeature(mid);
  }

  return fea;
}

function removeMid(line) {
  let mid = line.get("mid");
  if (mid) {
    let bezp = mid.get("bez");
    if (bezp !== null) {
      layersDict["lay"]["line"].getSource().removeFeature(bezp);
    }
    layersDict["lay"]["bez"]["point"].getSource().removeFeature(mid);
  }
  line.set("mid", null);

  timeseq.exportNew();
}

function setLine(line) {
  if (!line) return;
  let data = line.get("parent");
  let mid = line.get("mid");
  let cm1 = data[0].indexmap;
  let cm2 = data[1].indexmap;
  let p0 = cm1.getGeometry().getCoordinates();
  let p1 = cm2.getGeometry().getCoordinates();

  line.getGeometry().setCoordinates([p0, p1]);

  let dist = data[0].x - data[1].x;
  if (dist > 1 || dist < -1) {
    if (mid) {
      if (mid.get("points").length === 0) {
        let geomid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        line.get("mid").getGeometry().setCoordinates(geomid);
      } else {
        bezPoint(mid);
      }
    } else {
      mid = addLineMid([p0, p1]);
      if (mid) {
        line.set("mid", mid);
        mid.set("parent", line);
        layersDict["lay"]["bez"]["point"].getSource().addFeature(mid);
      }
    }
  } else {
    removeMid(line);
  }
}

function Bezier(p0, p1, p2, t) {
  let tpow = t * t;
  let minpow = Math.pow(1 - t, 2);
  let minpowt = (1 - t) * 2 * t;
  let bezp = [];

  bezp[0] = minpow * p0[0] + minpowt * p1[0] + tpow * p2[0];
  bezp[1] = minpow * p0[1] + minpowt * p1[1] + tpow * p2[1];
  return bezp;
}

function bezPoint(fea) {
  let data = fea.get("parent").get("parent");
  let p1 = fea.getGeometry().getCoordinates();
  let cm1 = data[0].indexmap;
  let cm2 = data[1].indexmap;
  let p0 = cm1.getGeometry().getCoordinates();
  let p2 = cm2.getGeometry().getCoordinates();

  let pathAmount = Math.abs(data[0].x - data[1].x);
  if (pathAmount <= 0) return;

  let acc = 1 / 100;
  let pre = p0,
    disttot = 0,
    bezpoints = [],
    bezdists = [],
    bezIntervals = [];
  let dist, bezp;
  for (let i = 0; i < 1.001; i += acc) {
    bezp = Bezier(p0, p1, p2, i);

    dist = Math.sqrt(
      Math.pow(bezp[0] - pre[0], 2) + Math.pow(bezp[1] - pre[1], 2)
    );
    bezpoints.push(bezp);
    bezdists.push(dist);
    disttot += dist;
    pre = bezp;
  }

  if (bezpoints.length > 0) {
    pre = bezpoints[0];
    bezIntervals.push(pre);

    let predist = 0,
      point,
      comp,
      sup,
      supdist,
      x,
      y;
    let pathdist = disttot / pathAmount;
    for (let i = 0, d = bezpoints.length; i < d; i++) {
      point = bezpoints[i];
      dist = bezdists[i];
      comp = predist + dist;
      while (true) {
        if (!(comp >= pathdist)) {
          break;
        }
        sup = pathdist - predist;
        supdist = sup / dist;
        x = pre[0] + (point[0] - pre[0]) * supdist;
        y = pre[1] + (point[1] - pre[1]) * supdist;
        bezIntervals.push([x, y]);

        pre = [x, y];
        predist = 0;
        dist = dist - sup;
        comp = predist + dist;
      }
      predist += dist;
      pre = point;
    }
  }

  if (fea.get("bez") === null) {
    let p = new ol.Feature({
      geometry: new ol.geom.MultiPoint(bezIntervals),
      layer: "line",
      name: "points",
    });

    p.setStyle(
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 3,
          fill: new ol.style.Fill({
            color: "rgba(0, 0, 255, 0.6)",
          }),
        }),
      })
    );
    fea.set("bez", p);
    fea.set("points", bezIntervals);
    layersDict["lay"]["line"].getSource().addFeature(p);
  } else {
    fea.set("points", bezIntervals);
    fea.get("bez").getGeometry().setCoordinates(bezIntervals);
  }

  timeseq.exportNew();
}

function checkAllLines() {
  let opp = { next: "pre", pre: "next" };
  let da1, da2, cm1, cm2, n, oppKey;

  for (let i = 1, n = chartT.data.datasets.length; i < n; i++) {
    let remArray = [];
    let ind = i;
    let ch = chartDict["indexToName"][ind];
    let nextN = sortedDict[ch]["start"];

    if (ch === "map") {
      let addArray = [];
      for (let z = 0, d = chartT.data.datasets[ind].data.length; z < d; z++) {
        if (nextN === null) continue;
        da1 = chartT.data.datasets[ind].data[nextN];
        cm1 = da1.indexmap;

        for (let lineK of Object.keys(da1.lines)) {
          if (da1.lines[lineK] !== null) {
            let allP = da1.lines[lineK].get("parent");
            let oppP = null;
            for (let p of allP) {
              let rem = false;
              if (p === undefined) {
                rem = true;
              } else if (p.cur !== da1.cur) {
                if (
                  ((p.step - 1 > da1.step || p.step <= da1.step) &&
                    lineK === "next") ||
                  ((p.step + 1 < da1.step || p.step >= da1.step) &&
                    lineK === "pre")
                ) {
                  rem = true;
                  p.lines[opp[lineK]] = null;
                }
              }

              if (rem) {
                removeMid(da1.lines[lineK]);
                layersDict["lay"]["line"]
                  .getSource()
                  .removeFeature(da1.lines[lineK]);

                da1.lines[lineK] = null;
              }
            }
          }
        }
        if (da1.next !== null) {
          if (da1.lines["next"] === null) {
            addArray.push(nextN);
          } else {
          }
        }
        nextN = da1.next;
      }
      for (let x of addArray) {
        da1 = chartT.data.datasets[ind].data[x];
        da2 = chartT.data.datasets[ind].data[da1.next];
        cm1 = da1.indexmap;
        cm2 = da2.indexmap;

        let fea = addLine(
          [
            cm1.getGeometry().getCoordinates(),
            cm2.getGeometry().getCoordinates(),
          ],
          [da1, da2]
        );
        da1.lines.next = fea;
        da2.lines.pre = fea;
      }
    }
  }
}

class Sourceframe {
  constructor() {
    this.sourceSel = "head";
    this.frames = {};
    this.frames["github_page_source"] = { frame: null, map: false, opt: {} };

    this.head = document.createElement("div");
    this.head.className = "geosource-sel";

    this.frame = document.createElement("div");
    this.frame.className = "geosource-sel-frame";

    this.filesEl = document.createElement("div");
    this.filesEl.className = "geosource-sel-files";

    this.closeButton = document.createElement("button");
    this.closeButton.className = "closeButton";
    this.closeButton.onclick = () => {
      this.close();
    };

    this.addjsonfile = document.createElement("button");
    this.addjsonfile.className = "mainButton mini";
    this.addjsonfile.innerHTML = "add GeoJSON file";
    this.addjsonfile.onclick = () => {
      this.frameFromJson();
    };

    this.addjsonGithub = document.createElement("button");
    this.addjsonGithub.className = "mainButton mini";
    this.addjsonGithub.innerHTML = "add GeoJSON from github";
    this.addjsonGithub.onclick = () => {
      this.newframe("github_page_source");
    };

    new moveEl(this.head);

    this.head.appendChild(this.closeButton);
    this.head.appendChild(this.frame);
    this.frame.appendChild(this.addjsonfile);
    this.frame.appendChild(this.addjsonGithub);

    this.frame.appendChild(this.filesEl);
    container1.appendChild(this.head);
    this.allSources();
  }

  close() {
    this.checkMapVisibility(0);
    this.head.remove();
  }

  open() {
    this.checkMapVisibility(1);
    this.optFunc();

    container1.appendChild(this.head);
  }

  backFrame(child) {
    this.checkMapVisibility(0);

    this.sourceSel = "head";
    this.head.removeChild(child.head);
    this.head.appendChild(this.frame);
  }

  checkMapVisibility(type = 0) {
    if (type === 0) {
      for (let x in this.frames) {
        if (this.frames[x].map) {
          layersDict["source"]["data"][x].setOpacity(0);
          layersDict["source"]["data"][x].setVisible(false);
        }
      }
    } else if (type === 1) {
      if (this.frames.hasOwnProperty(this.sourceSel)) {
        if (this.frames[this.sourceSel].map) {
          layersDict["source"]["data"][this.sourceSel].setOpacity(1);
          layersDict["source"]["data"][this.sourceSel].setVisible(true);
        }
      }
    }
    if (this.frames.hasOwnProperty(this.sourceSel)) {
      if (this.frames[this.sourceSel].map) {
        for (let i = 1, n = chartT.data.datasets.length; i < n; i++) {
          if (
            chartT.data.datasets[i].data.length === 0 ||
            chartT.data.datasets[i].use === false
          )
            continue;

          let ch = chartDict["indexToName"][String(i)];
          if (chartDict[ch] === "geo") {
            let vis =
              type === 0 ? true : type === 1 ? false : type === 3 ? true : true;
            layersDict["lay"][chartT.data.datasets[i].data[0].title].setVisible(
              vis
            );
          }
        }
      }
    }
  }

  addSource(url, name = "") {
    layersDict["source"]["size"]++;
    let num = layersDict["source"]["size"];
    let nameL = `source${num}`;

    let nameFile = name ? name : nameL;

    let geojsonSource = new ol.source.Vector({
      url: url,
      format: new ol.format.GeoJSON(),
    });

    const styleT = createStyleTableMap(0);

    let geojsonLayer = new ol.layer.Vector({
      sourcename: nameL,
      filename: nameFile,
      title: "url",
      source: geojsonSource,
      opacity: 0.0,
      style: styleT,
      visible: true,
    });

    layersDict["source"]["data"][nameL] = geojsonLayer;
    map.addLayer(geojsonLayer);

    this.allSources(nameL);

    return nameL;
  }

  allSources(cur = null) {
    while (this.filesEl.firstChild) {
      this.filesEl.removeChild(this.filesEl.firstChild);
    }
    let clickEv = null;
    let keysS = Object.keys(layersDict["source"]["data"]);

    if (keysS.length > 0) {
      let elInstr = document.createElement("span");
      elInstr.innerHTML = "Select to create table";
      this.filesEl.appendChild(elInstr);
    }

    for (let i = 0, d = keysS.length; i < d; i++) {
      let buttonS = document.createElement("button");
      let layerS = layersDict["source"]["data"][keysS[i]];
      buttonS.innerHTML = layerS.get("filename");
      buttonS.onclick = () => {
        this.sourceSel = layerS.get("sourcename");
        this.newframe();
      };
      this.filesEl.appendChild(buttonS);

      if (cur) {
        if (cur === keysS[i]) {
          clickEv = buttonS;
        }
      }
    }
  }

  frameFromJson() {
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      let file = e.target.files[0];

      this.readURLfile(file);
    };
    input.click();
  }

  readURLfile(file) {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.addEventListener(
        "load",
        (() => {
          let nameSource = this.addSource(reader.result, file.name);
          resolve(nameSource);
        }).bind(this),
        false
      );
      reader.readAsDataURL(file);
    });
  }

  optFunc() {
    if (this.frames.hasOwnProperty(this.sourceSel)) {
      for (let x in this.frames[this.sourceSel].opt) {
        this.frames[this.sourceSel].opt[x].func(
          this.frames[this.sourceSel].opt[x].arg
        );
      }
    }
  }

  newframe(newSource = null) {
    if (newSource !== null) this.sourceSel = newSource;

    this.frame.remove();
    let change = false;
    if (this.frames.hasOwnProperty(this.sourceSel)) {
      if (this.frames[this.sourceSel]["frame"]) {
        change = true;
      }
    }

    if (change) {
      this.head.appendChild(this.frames[this.sourceSel]["frame"].frame);
    } else {
      this.frames[this.sourceSel] = { frame: null, map: false, opt: {} };

      if (this.sourceSel === "github_page_source") {
        this.frames[this.sourceSel]["frame"] = new Githubframe(this);
      } else {
        this.frames[this.sourceSel]["map"] = true;
        this.frames[this.sourceSel]["frame"] = new FeatureTable(
          this,
          this.sourceSel
        );
      }
    }
    this.checkMapVisibility(1);
    this.optFunc();
  }
}

class Githubframe {
  constructor(parent) {
    this.parent = parent;
    this.rowElements = [];

    this.timekey;
    this.reading = false;
    this.params = {
      owner: "nvkelso",
      repo: "natural-earth-vector",
      path: "geojson",
    };

    this.head = document.createElement("div");
    this.head.className = "geosource-sel-frame";

    this.backButton = document.createElement("button");
    this.backButton.className = "mainButton mini";
    this.backButton.innerHTML = "back";
    this.backButton.onclick = () => {
      this.backFrame();
    };

    this.filesEl = document.createElement("div");

    this.tableCont = document.createElement("div");
    this.tableCont.className = "table-container";

    this.parent.head.appendChild(this.head);
    this.head.appendChild(this.backButton);
    this.head.appendChild(this.filesEl);

    this.head.appendChild(this.tableCont);
    this.allFiles();
  }

  async allFiles() {
    while (this.tableCont.firstChild) {
      this.tableCont.removeChild(this.tableCont.firstChild);
    }

    let table = document.createElement("table");
    table.className = "tabel-sel";
    let url = "https://api.github.com/repos/";
    let params = this.params;

    url = url + params.owner + "/" + params.repo + "/contents/" + params.path;
    let res = await fetch(url);
    res = await res.json();
    if (res.length === 0) return;

    let tr, td;

    tr = table.insertRow(-1);

    let th = document.createElement("th");
    th.appendChild(
      (() => {
        const contEl = document.createElement("div");
        contEl.className = "params-div";
        for (let keyP of Object.keys(params)) {
          contEl.appendChild(
            (() => {
              const inpcontEl = document.createElement("div");
              inpcontEl.className = "param-div";
              inpcontEl.innerHTML = keyP + ":";
              const inpheaderEl = document.createElement("input");
              inpheaderEl.type = "text";
              inpheaderEl.spellcheck = false;

              inpheaderEl.name = keyP;
              inpheaderEl.value = params[keyP];
              inpheaderEl.style.width = inpheaderEl.value.length + "ch";
              inpheaderEl.addEventListener("keyup", (el) => {
                this.searchParams(el, { [keyP]: el.target.value });
              });

              inpcontEl.appendChild(inpheaderEl);
              return inpcontEl;
            })()
          );
        }
        return contEl;
      })()
    );
    let inpEl = document.createElement("input");
    inpEl.type = "text";
    inpEl.spellcheck = false;
    inpEl.placeholder = "Search..";
    inpEl.addEventListener("keyup", (el) => {
      this.keyInput(el);
    });

    th.appendChild(inpEl);

    tr.appendChild(th);

    for (let i = 0, d = res.length; i < d; i++) {
      tr = table.insertRow(-1);
      this.rowElements.push(tr);

      td = tr.insertCell(-1);
      td.innerHTML = res[i].name;
      td.onclick = async (el) => {
        if (!this.reading) {
          this.reading = true;
          el.target.parentNode.classList.add("select");
          let fileRes = await fetch(res[i].download_url);
          let file = new File([await fileRes.blob()], res[i].name);

          const sourceName = await this.parent.readURLfile(file);
          file = null;
          this.reading = false;
          el.target.parentNode.classList.remove("select");
          this.backFrame();
        }
      };
    }

    this.tableCont.appendChild(table);
  }

  keyInput(e) {
    if (e.type == "keyup") {
      if (this.timekey) clearTimeout(this.timekey);
      this.timekey = setTimeout(() => {
        this.searchT(e);
      }, 500);
    }
  }

  searchParams(e, arg) {
    if (e.type == "keyup") {
      Object.assign(this.params, arg);
      if (e.keyCode === 13) {
        this.allFiles();
      }
    }
  }

  searchT(e) {
    if (e.type == "keyup") {
      let cellIndex = e.target.parentNode.cellIndex;
      let searchText = e.target.value.toLowerCase();
      for (let i = 0, d = this.rowElements.length; i < d; i++) {
        let val = this.rowElements[i].cells[cellIndex].innerHTML.toLowerCase();
        if (val.indexOf(searchText) !== -1) {
          this.rowElements[i].style.display = "";
        } else {
          this.rowElements[i].style.display = "none";
        }
      }
    }
  }
  get frame() {
    return this.head;
  }

  backFrame() {
    this.parent.backFrame(this);
  }
}

class FeatureTable {
  constructor(parent, source) {
    this.parent = parent;
    this.source = source;

    this.loaded = false;

    this.selFeatures = [];
    this.selElements = [];
    this.rowElements = [];
    this.keys = [];

    this.features = [];
    this.geojsonSource = layersDict["source"]["data"][this.source].getSource();

    this.timekey;

    this.mapFeature = [];
    Object.assign(this.parent.frames[this.source].opt, {
      seeGeo: { func: this.seeGeo.bind(this), arg: true },
    });

    this.createButton = document.createElement("button");
    this.createButton.className = "mainButton mini";
    this.createButton.innerHTML = "create";
    this.createButton.onclick = () => {
      this.createSel();
    };

    this.unSelectAllButton = document.createElement("button");
    this.unSelectAllButton.className = "mainButton mini";
    this.unSelectAllButton.innerHTML = "deselect";
    this.unSelectAllButton.onclick = () => {
      this.deSelect();
    };

    this.SelectAllButton = document.createElement("button");
    this.SelectAllButton.className = "mainButton mini";
    this.SelectAllButton.innerHTML = "select all";
    this.SelectAllButton.onclick = () => {
      this.selectAll();
    };

    this.backButton = document.createElement("button");
    this.backButton.className = "mainButton mini";
    this.backButton.innerHTML = "back";
    this.backButton.onclick = () => {
      this.backFrame();
    };

    this.seeGeoButton = document.createElement("button");
    this.seeGeoButton.className = "mainButton mini";
    this.seeGeoButton.innerHTML = "view added layers: on";
    this.seeGeoButton.onclick = () => {
      const arg = !this.parent.frames[this.source].opt.seeGeo.arg;
      this.parent.frames[this.source].opt.seeGeo.arg = arg;
      this.seeGeo(this.parent.frames[this.source].opt.seeGeo.arg);
    };

    this.head = document.createElement("div");
    this.head.className = "geosource-sel-frame";
    this.parent.head.appendChild(this.head);

    this.head.appendChild(this.createButton);
    this.head.appendChild(this.SelectAllButton);
    this.head.appendChild(this.unSelectAllButton);
    this.head.appendChild(this.seeGeoButton);
    this.head.appendChild(this.backButton);

    this.start();
  }

  get frame() {
    return this.head;
  }

  displayFromMap(e) {
    if (e.dragging) {
      return;
    }
    const pixel = map.getEventPixel(e.originalEvent);
    const nameL = this.source;
    let i = null;
    const clicked = e.type === "click" ? true : false;

    map.forEachFeatureAtPixel(
      pixel,
      (sel) => {
        i = sel.get("row");
        return;
      },
      {
        layerFilter: function (layer) {
          if (layer.get("title") === "url") {
            if (layer.get("sourcename") === nameL) {
              return true;
            }
          }
        },
      }
    );

    this.hoverEl("map", i, clicked);
  }

  fromMap() {
    const bindFunction = this.displayFromMap.bind(this);

    layersDict["source"]["data"][this.source].setOpacity(1);
    map.on("pointermove", bindFunction);
    map.on("click", bindFunction);
  }

  createTable() {
    this.features = this.geojsonSource.getFeatures();

    let tableCont = document.createElement("div");
    tableCont.className = "table-container";

    let table = document.createElement("table");
    table.className = "tabel-sel";

    let keys = [];
    let keyRow = table.insertRow(-1);

    for (let i = 0, d = this.features.length; i < d; i++) {
      for (let key of this.features[i].getKeys()) {
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
      }
    }
    keys.sort();
    let adminInd = keys.indexOf("ADMIN");
    if (adminInd > 0) {
      keys.unshift(keys.splice(adminInd, 1)[0]);
    }

    for (let i = 0, d = keys.length; i < d; i++) {
      let th = document.createElement("th");
      th.innerHTML = keys[i];
      let inpEl = document.createElement("input");
      inpEl.className = "input-sel";
      inpEl.type = "text";
      inpEl.spellcheck = false;
      inpEl.placeholder = "Search..";
      inpEl.addEventListener("keyup", (el) => {
        this.keyInput(el);
      });

      th.appendChild(document.createElement("br"));
      th.appendChild(inpEl);

      keyRow.appendChild(th);
    }
    let tr, td, text;
    for (let i = 0, d = this.features.length; i < d; i++) {
      tr = table.insertRow(-1);
      this.rowElements.push(tr);

      this.features[i].set("row", i);

      tr.setAttribute("data-featureRow", i);

      tr.onmouseover = (e) => {
        this.hoverEl(e.type, i);
      };
      tr.onclick = (e) => {
        this.hoverEl(e.type, i);
      };

      for (let x = 0, z = keys.length; x < z; x++) {
        td = tr.insertCell(-1);
        text = this.features[i].get([keys[x]]);
        if (typeof text !== "string" && typeof text !== "number") text = "";
        td.innerHTML = String(text);
      }
    }

    this.keys = keys;

    this.fromMap();

    tableCont.appendChild(table);
    this.head.appendChild(tableCont);
    this.loaded = true;
  }

  keyInput(e) {
    if (e.type == "keyup") {
      if (this.timekey) clearTimeout(this.timekey);
      this.timekey = setTimeout(() => {
        this.searchEl(e);
      }, 500);
    }
  }

  searchEl(e) {
    if (e.type == "keyup") {
      let cellIndex = e.target.parentNode.cellIndex;
      let searchText = e.target.value.toLowerCase();
      for (let i = 0, d = this.rowElements.length; i < d; i++) {
        let val = this.rowElements[i].cells[cellIndex].innerHTML.toLowerCase();
        if (val.indexOf(searchText) !== -1) {
          this.rowElements[i].style.display = "";
        } else {
          this.rowElements[i].style.display = "none";
        }
      }
    }
  }

  selectEl(el, i) {
    if (el.classList.toggle("select")) {
      const ind_selElements = this.selElements.length;
      const ind_selFeatures = this.selFeatures.length;

      this.selElements.push(el);
      this.selFeatures.push(this.features[i]);

      el.setAttribute("data-ind_selElements", ind_selElements);
      el.setAttribute("data-ind_selFeatures", ind_selFeatures);

      if (el.classList.contains("hover-map")) {
        el.classList.remove("hover-map");
      }
      this.features[i].setStyle(createStyleTableMap(2));
    } else {
      let ind_selElements = el.getAttribute("data-ind_selElements");
      let ind_selFeatures = el.getAttribute("data-ind_selFeatures");

      if (ind_selElements !== null && ind_selFeatures !== null) {
        ind_selElements = parseInt(ind_selElements);
        ind_selFeatures = parseInt(ind_selFeatures);

        delete this.selElements[ind_selElements];
        delete this.selFeatures[ind_selFeatures];

        el.removeAttribute("data-ind_selElements");
        el.removeAttribute("data-ind_selFeatures");

        this.features[i].setStyle(createStyleTableMap(0));
      }
    }
  }

  hoverEl(tableT, i, clickmap = false) {
    let selInd = false,
      popIt;
    let clicked = tableT === "click" ? true : clickmap;

    if (i !== null) {
      if (clicked) {
        this.selectEl(this.rowElements[i], i);
      }
      const cl = this.rowElements[i].classList;

      if (!cl.contains("hover-map")) {
        if (!cl.contains("select")) {
          cl.add("hover-map");
          this.features[i].setStyle(createStyleTableMap(1));
          selInd = i;
          this.mapFeature.push(selInd);
        }
      }
    }
    while (this.mapFeature.length) {
      popIt = this.mapFeature.pop();
      if (popIt !== i) {
        const cl = this.rowElements[popIt].classList;
        if (cl.contains("hover-map")) {
          cl.remove("hover-map");
          this.features[popIt].setStyle(createStyleTableMap(0));
        }
      } else {
        selInd = popIt;
      }
    }

    if (selInd !== false) {
      this.mapFeature.push(selInd);
    }
  }

  createSel() {
    if (this.selFeatures.length === 0) return;
    this.addLayerfromTable(mergeFeatures(this.selFeatures));
  }

  addLayerfromTable(ff, opt = {}) {
    let num = Object.keys(chartDict["indexToName"]).length;
    let nameL = `layer${num + 1}`;
    layersDict["chart"]["size"]++;

    markerDict[nameL] = [];
    chartDict["indexToName"][`${num + 1}`] = nameL;
    chartDict["indexToData"][nameL] = num + 1;
    chartDict[nameL] = "geo";
    sortedDict[nameL] = {
      start: null,
      end: null,
    };

    chartT.options.scales.y.min -= 2;
    chartT.data.datasets[0].data[0].y = chartT.options.scales.y.min;

    canvCon.style.height = `${(orgCanvHeight += chartSizeDict["add"])}px`;

    chartT.data.datasets.push(
      new optionlayer({
        mapZ: num,
      })
    );

    let numD = chartT.data.datasets.length - 1;

    let laySource = new ol.source.Vector({
      features: [],
    });

    let layLayer = new ol.layer.Vector({
      source: laySource,
      title: nameL,
      zIndex: num,
    });

    let laySourceR = new ol.source.Vector({
      features: [],
    });

    let layLayerR = new ol.layer.Vector({
      className: "ol-layer-export" + " layer_" + nameL,
      source: laySourceR,
      title: nameL,
      zIndex: num,
    });

    layersDict["lay"][nameL] = layLayer;
    layersDict["lay"][nameL + "_ren"] = layLayerR;
    map.addLayer(layLayer);
    mapRender.addLayer(layLayerR);

    laySource.clear();

    let ffRen = ff.clone();

    markerDict[nameL].push(ff);

    setZlayers(layersDict["lay"]["map"].getZIndex());

    let data = addKeyframe(
      numD,
      1 - (layersDict["chart"]["size"] - 1) * 2,
      ff,
      Object.assign({}, defaultLay["geo"], opt),
      ffRen
    );

    data["name"] = "geojson";
    data["title"] = nameL;

    ff.set("chart", data);

    ff.setStyle(
      createStyleGeo(
        data["color"],
        data["opacity"],
        data["colorstroke"],
        data["opacitystroke"],
        data["widthStroke"]
      )
    );

    laySource.addFeatures([ff]);
    laySourceR.addFeatures([ffRen]);

    chartT.resize();
    return num + 1;
  }

  deSelect() {
    for (let i = 0, d = this.selElements.length; i < d; i++) {
      if (this.selElements[i]) {
        if (this.selElements[i].classList.contains("select")) {
          this.selectEl(
            this.selElements[i],
            this.selElements[i].getAttribute("data-featureRow")
          );
        }
      }
    }
    this.selFeatures = [];
    this.selElements = [];
  }

  selectAll() {
    for (let i = 0, d = this.rowElements.length; i < d; i++) {
      if (this.rowElements[i].style.display === "none") continue;

      if (!this.rowElements[i].classList.contains("select")) {
        this.selectEl(this.rowElements[i], i);
      }
    }
  }

  seeGeo(arg) {
    let vis = arg === true ? 3 : 1;
    let innerT = arg === true ? "on" : "off";
    this.seeGeoButton.innerHTML = "view added layers: " + innerT;

    this.parent.checkMapVisibility(vis);
  }

  start() {
    if (this.geojsonSource.getFeatures().length != 0) this.createTable();
    else {
      let sourceChangeListener = this.geojsonSource.on(
        "featuresloadend",
        (() => {
          if (this.geojsonSource.getState() == "ready") {
            this.geojsonSource.un("change", sourceChangeListener);
            this.createTable();
          }
        }).bind(this)
      );
    }
  }

  backFrame() {
    this.parent.backFrame(this);
  }
}

class coordInput {
  constructor(parent, num, elNum) {
    this.parent = parent;

    this._num = num;
    this._elNum = elNum;

    this._feature = null;
    this._id = `searchCont_${this._elNum}`;

    this.head = document.createElement("div");
    this.head.className = "routeControl";

    this.inpCont = document.createElement("div");
    this.inpCont.className = "searchCont";
    this.inpCont.id = this._id;

    this.inpEl = document.createElement("input");

    this.inpEl.spellcheck = false;
    this.inpEl.setAttribute("data-order", this._num);
    this.inpEl.addEventListener("keyup", (el) => {
      this.changeInput(el);
    });

    this.orderContainer1 = document.createElement("div");
    this.orderContainer1.className = "orderContainer";

    this.mapB = document.createElement("div");
    this.mapB.className = "orderButton";
    this.mapB.innerHTML = "map";
    this.mapB.onclick = () => {
      this.map();
    };

    this.orderContainer2 = document.createElement("div");
    this.orderContainer2.className = "orderContainer";

    this.upB = document.createElement("div");
    this.upB.className = "orderButton";
    this.upB.innerHTML = "⮝";
    this.upB.onclick = () => {
      this.move(-1);
    };

    this.downB = document.createElement("div");
    this.downB.className = "orderButton";
    this.downB.innerHTML = "⮟";
    this.downB.onclick = () => {
      this.move(1);
    };

    this.orderContainer3 = document.createElement("div");
    this.orderContainer3.className = "orderContainer";

    this.addB = document.createElement("div");
    this.addB.className = "orderButton";
    this.addB.innerHTML = "add";
    this.addB.onclick = () => {
      this.add();
    };

    this.delB = document.createElement("div");
    this.delB.className = "orderButton";
    this.delB.innerHTML = "del";
    this.delB.onclick = () => {
      this.del();
    };

    this.orderContainer4 = document.createElement("div");
    this.orderContainer4.className = "orderContainer";

    this.lineB = document.createElement("div");
    this.lineB.className = "orderButton";
    this.lineB.innerHTML = "add Line";
    this.lineB.onclick = () => {
      this.line();
    };

    this.inpCont.appendChild(this.inpEl);

    this.orderContainer1.appendChild(this.mapB);

    this.orderContainer2.appendChild(this.upB);
    this.orderContainer2.appendChild(this.downB);

    this.orderContainer3.appendChild(this.addB);
    this.orderContainer3.appendChild(this.delB);

    this.orderContainer4.appendChild(this.lineB);

    this.head.appendChild(this.orderContainer1);

    this.head.appendChild(this.inpCont);

    this.head.appendChild(this.orderContainer2);
    this.head.appendChild(this.orderContainer3);
    this.head.appendChild(this.orderContainer4);

    this.parent._inputs[this._id] = {
      elNum: this._elNum,
      coordinates: [],
      element: this,
      order: this._num,
      linebreak: false,
    };
  }

  changeInput(el) {
    this.parent.changeInput(el, this);
  }

  line() {
    this.parent.linebreak(this);
  }

  del() {
    this.parent.delInput(this);
  }

  add() {
    this.parent.addInput(this);
  }

  move(direction) {
    this.parent.moveInput(direction, this);
  }

  map() {
    this.parent.centerMap(this);
  }

  confirm(res) {
    this.parent.confirm(res, this);
  }

  get fea() {
    return this._feature;
  }

  set fea(feature) {
    this._feature = feature;
  }

  get order() {
    return this.parent._inputs[this._id].order;
  }

  set order(num) {
    this.parent._inputs[this._id].order = num;
  }

  get el() {
    return this.head;
  }

  get input() {
    return this.inpEl;
  }

  get key() {
    return this._id;
  }
}

class Routeframe {
  constructor() {
    this._url = "http://router.project-osrm.org";
    this._params = {
      service: "route",
      version: "v1",
      profile: "foot",
      coordinates: "",
      steps: false,
      geometries: "geojson",
      overview: "simplified",
    };
    this._paramSeparator = [
      {
        sep: "/",
        list: ["service", "version", "profile", "coordinates"],
        declare: false,
      },
      { sep: "", list: ["steps"], declare: true },
      { sep: "&", list: ["geometries", "overview"], declare: true },
    ];

    this._opt = { overwrite: true };

    this._inputs = {};
    this._inputsNum = 0;

    this.head = document.createElement("div");
    this.head.className = "routeframe";

    this.frame = document.createElement("div");
    this.frame.className = "routeframe-frame";

    this.start = new coordInput(this, 0, this.elNum());

    this.end = new coordInput(this, 1, this.elNum());

    this.createButton = document.createElement("button");
    this.createButton.className = "mainButton mini";
    this.createButton.innerHTML = "Create";
    this.createButton.onclick = () => {
      this.create();
    };

    const overwriteList = [
      ["overwrite", true],
      ["new", false],
    ];
    this.overwriteSelect = document.createElement("select");
    for (let x of overwriteList) {
      const opt = document.createElement("option");
      if (this._opt.overwrite === x[0]) opt.selected = "selected";

      opt.value = x[1];
      opt.innerHTML = x[0];
      this.overwriteSelect.appendChild(opt);
    }
    this.overwriteSelect.onchange = (e) => {
      this.selectOpt(e, "overwrite");
    };

    this.swapButton = document.createElement("button");
    this.swapButton.className = "mainButton mini";
    this.swapButton.innerHTML = "Swap";
    this.swapButton.onclick = () => {
      this.swapAll();
    };

    const profileList = ["car", "bike", "foot"];
    this.profileSelect = document.createElement("select");
    for (let x of profileList) {
      const opt = document.createElement("option");
      if (this._params.profile === x) opt.selected = "selected";

      opt.value = x;
      opt.innerHTML = x;
      this.profileSelect.appendChild(opt);
    }
    this.profileSelect.onchange = (e) => {
      this.selectParams(e, "profile");
    };

    const overviewList = ["simplified", "full"];
    this.overviewSelect = document.createElement("select");
    for (let x of overviewList) {
      const opt = document.createElement("option");
      if (this._params.overview === x) opt.selected = "selected";

      opt.value = x;
      opt.innerHTML = x;
      this.overviewSelect.appendChild(opt);
    }
    this.overviewSelect.onchange = (e) => {
      this.selectParams(e, "overview");
    };

    this.closeButton = document.createElement("button");
    this.closeButton.className = "mainButton mini";
    this.closeButton.className = "closeButton";
    this.closeButton.onclick = () => {
      this.close();
    };

    new moveEl(this.head);

    this.frame.appendChild(this.start.el);
    this.frame.appendChild(this.end.el);

    this.frame.appendChild(this.createButton);
    this.frame.appendChild(this.overwriteSelect);

    this.frame.appendChild(this.profileSelect);
    this.frame.appendChild(this.overviewSelect);

    this.frame.appendChild(this.swapButton);

    this.frame.appendChild(this.closeButton);

    this.head.appendChild(this.frame);
    container1.appendChild(this.head);
  }

  changeInput(e, child) {
    if (e.type == "keyup") {
      searchPlace(e, child);
    }
  }

  selectOpt(e, opt) {
    this._opt[opt] = e.target.value;
  }

  selectParams(e, opt) {
    this._params[opt] = e.target.value;
  }

  delInputFromFeature(fea) {
    const child = this._inputs[fea.get("routeKey")].element;
    this.delInput(child);
  }

  delInput(child) {
    if (child.fea) {
      layersDict["lay"]["track"].getSource().removeFeature(child.fea);
      child.fea = null;
    }

    if (Object.keys(this._inputs).length <= 2) {
      child.input.value = "";
      child.input.placeholder = "";
      child.input.style["pointer-events"] = "auto";

      this._inputs[child.key].coordinates = [];
      return false;
    }

    for (let key in this._inputs) {
      const x = this._inputs[key];
      if (x.order > this._inputs[child.key].order) x.order -= 1;
    }

    this.frame.removeChild(this._inputs[child.key].element.el);
    delete this._inputs[child.key];
  }

  addInput(child) {
    const num = this._inputs[child.key].order + 1;

    for (let key in this._inputs) {
      const x = this._inputs[key];
      if (x.order >= num) x.order += 1;
    }

    const el = new coordInput(this, num, this.elNum());
    this.frame.insertBefore(
      el.el,
      this._inputs[child.key].element.el.nextSibling
    );

    return el;
  }

  swapEl(el1, el2) {
    let tempNum = el1.order;
    el1.order = el2.order;
    el2.order = tempNum;

    let temp1 = document.createElement("span");
    let temp2 = document.createElement("span");

    this.frame.replaceChild(temp1, el1.el);
    this.frame.replaceChild(temp2, el2.el);

    this.frame.replaceChild(el1.el, temp2);
    this.frame.replaceChild(el2.el, temp1);
  }

  moveInput(direction, child) {
    let num = this._inputs[child.key].order + direction;

    if (num < 0) num = Object.keys(this._inputs).length - 1;
    if (num >= Object.keys(this._inputs).length) num = 0;

    let swapElement = null;

    for (let key in this._inputs) {
      const x = this._inputs[key];
      if (x.order === num) {
        swapElement = x.element;
      }
    }

    if (swapElement) this.swapEl(child, swapElement);
  }

  swapAll() {
    let lengthArray = Object.keys(this._inputs).length;

    let unsorted = new Array(lengthArray).fill(null);
    let sorted = new Array(lengthArray).fill(null);
    let doneList = new Array();

    for (let key in this._inputs) {
      const x = this._inputs[key];
      const numSort = Math.abs(lengthArray - 1 - x.order);
      if (numSort === x.order) continue;

      unsorted[x.order] = x.element;
      sorted[numSort] = x.order;
    }

    for (let i = 0; i < lengthArray; i++) {
      if (unsorted[i] === null) continue;
      if (doneList.includes(unsorted[sorted[i]].order)) continue;

      this.swapEl(unsorted[i], unsorted[sorted[i]]);
      doneList.push(unsorted[i].order);
    }
  }

  linebreak(child) {
    const el = this.addInput(child);

    this._inputs[el.key].linebreak = true;
    el.input.value = "";
    el.input.placeholder = "—— Line between ↕ ——";
    el.input.style["pointer-events"] = "none";
  }

  moveMarker(fea) {
    const geo = fea.getGeometry().getCoordinates();
    const child = this._inputs[fea.get("routeKey")].element;

    this.addCoord(geo, child);
  }

  addMarker(geo, child) {
    let fea = new ol.Feature({
      geometry: new ol.geom.Point(geo),
      name: `route`,
      layer: "track",
      routeKey: child.key,
    });
    fea.setStyle(createStyleRouteMarker());
    layersDict["lay"]["track"].getSource().addFeature(fea);

    child.fea = fea;

    return fea;
  }

  centerMap(child) {
    let center = viewT.getCenter();

    if (child.fea) {
      child.fea.getGeometry().setCoordinates(center);
    } else {
      this.addMarker(center, child);
    }

    this.addCoord(center, child);
  }

  addCoord(coord, child) {
    const LonLat = ol.proj.toLonLat(coord);
    this._inputs[child.key]["coordinates"] = LonLat;
    this._inputs[child.key].linebreak = false;

    const coordString = LonLat.map((x) => Math.round(x * 100) / 100).toString();

    child.input.value = "";
    child.input.placeholder = "Coord: " + coordString;
    child.input.style["pointer-events"] = "none";
  }

  elNum() {
    this._inputsNum++;
    return this._inputsNum;
  }

  confirm(res, child) {
    const geo = toCenter(res.geometry.coordinates);
    if (child.fea) {
      child.fea.getGeometry().setCoordinates(geo);
    } else {
      this.addMarker(geo, child);
    }

    this._inputs[child.key]["coordinates"] = res.geometry.coordinates;
    this._inputs[child.key].linebreak = false;
  }

  createDel() {
    let i = chartT.data.datasets.length - 1;
    let last_ind = null;

    for (let d = chartT.data.datasets.length; i < d && 0 <= i; i--) {
      if (chartT.data.datasets[i].use === false) continue;

      let ch = chartDict["indexToName"][i];
      if (chartDict[ch] === "route") {
        last_ind = i;
        break;
      }
    }

    if (last_ind !== null) {
      i = 0;
      let d = chartT.data.datasets[last_ind].data.length;
      let last_ind_data = 0;
      for (; i < d; i++) {
        last_ind_data = d - 1 - i;
        curSelChar = [last_ind, last_ind_data];
        deleteHandler();
      }
    }
  }

  async create() {
    const sortedList = new Array(Object.keys(this._inputs).length);
    for (const x in this._inputs) {
      sortedList[this._inputs[x].order] = this._inputs[x];
    }

    const coordinates = [[]];
    let ind = 0;
    for (const x of sortedList) {
      if (x.linebreak) {
        coordinates.push(new Array());
        ind++;
      } else {
        if (x.coordinates.length > 0) {
          coordinates[ind].push(x.coordinates);
        }
      }
    }
    let resList = [];
    let waypoints = [];

    for (let z = 0; z < coordinates.length; z++) {
      if (coordinates[z].length === 0) continue;
      else if (coordinates[z].length === 1) {
        resList.push([coordinates[z][0]]);
        waypoints.push(coordinates[z][0]);
        continue;
      }

      let coordString = "";
      for (let i = 0; i < coordinates[z].length; i++) {
        if (coordinates[z][i].length > 1) {
          coordString += coordinates[z][i].toString() + ";";
        }
      }
      if (coordString === "") return false;

      coordString = coordString.substring(0, coordString.length - 1) + "?";
      this._params["coordinates"] = coordString;

      let url = this._url;

      for (let x of this._paramSeparator) {
        for (let y of x.list) {
          url += x.sep;
          url += x.declare ? y + "=" + this._params[y] : this._params[y];
        }
      }

      let res = await fetchRoute(url);
      if (res.code == "Ok") {
        resList.push(res["routes"][0]["geometry"]["coordinates"]);

        for (let x of res["waypoints"]) {
          waypoints.push(x.location);
        }
      }
    }

    if (resList.length > 0) {
      if (this._opt["overwrite"]) this.createDel();

      resList = resList.flat();
      createRouteLayer(resList, waypoints);
    }
  }

  open() {
    container1.appendChild(this.head);
  }

  close() {
    this.head.remove();
  }
}

function creatElGeoSource() {
  if (sourceframeDiv) {
    sourceframeDiv.open();
  } else {
    sourceframeDiv = new Sourceframe();
  }
}

function createTrackPoint() {
  let fea = new ol.Feature({
    geometry: new ol.geom.Point(viewT.getCenter()),
    name: `track`,
    layer: "track",
  });
  fea.setStyle(createStyleTrack());
  layersDict["lay"]["track"].getSource().addFeature(fea);
}

function moveTrackpoint(fea) {}

function deleteTrackPoint(fea) {
  layersDict["lay"]["track"].getSource().removeFeature(fea);
  deselectChar();
}

function addRouteLayer(ff, route, waypoints) {
  let num = Object.keys(chartDict["indexToName"]).length;
  let nameL = `route${num + 1}`;

  layersDict["chart"]["size"]++;
  markerDict[nameL] = [];
  chartDict["indexToName"][`${num + 1}`] = nameL;
  chartDict["indexToData"][nameL] = num + 1;
  chartDict[nameL] = "route";
  sortedDict[nameL] = {
    start: null,
    end: null,
  };
  chartT.options.scales.y.min -= 2;
  chartT.data.datasets[0].data[0].y = chartT.options.scales.y.min;
  canvCon.style.height = `${(orgCanvHeight += chartSizeDict["add"])}px`;
  chartT.data.datasets.push(
    new optionlayer({
      mapZ: num,
      route: route,
      waypoints: waypoints,
    })
  );

  let numD = chartT.data.datasets.length - 1;
  let laySource = new ol.source.Vector({
    features: [],
  });
  let layLayer = new ol.layer.Vector({
    source: laySource,
    title: nameL,
    zIndex: num,
  });

  let laySourceR = new ol.source.Vector({
    features: [],
  });
  let layLayerR = new ol.layer.Vector({
    className: "ol-layer-export" + " layer_" + nameL,
    source: laySourceR,
    title: nameL,
    zIndex: num,
  });

  layersDict["lay"][nameL] = layLayer;
  layersDict["lay"][nameL + "_ren"] = layLayerR;

  map.addLayer(layLayer);
  mapRender.addLayer(layLayerR);

  laySource.clear();
  let ffRen = ff.clone();
  markerDict[nameL].push(ff);

  setZlayers(layersDict["lay"]["map"].getZIndex());
  let data = addKeyframe(
    numD,
    1 - (layersDict["chart"]["size"] - 1) * 2,
    ff,
    defaultLay["route"],
    ffRen
  );

  data["name"] = "route";
  data["title"] = nameL;
  ff.set("chart", data);
  ff.setStyle(
    createStyleRoute(
      data["colorstroke"],
      data["opacitystroke"],
      data["widthStroke"],
      data["lineDash"],
      data["lineCap"],
      data["lineJoin"],
      data["lineDashOffset"]
    )
  );

  laySource.addFeatures([ff]);
  laySourceR.addFeatures([ffRen]);
  chartT.resize();
  return num + 1;
}

function divideColor(da1, da2, step) {
  const coldiff = { change: false, list: new Array(da1.length) };

  coldiff["list"].fill(0);

  for (let i = 0, n = da1.length; i < n; i++) {
    const diff = (da2[i] - da1[i]) * step;
    if (diff !== 0) coldiff["change"] = true;
    coldiff["list"][i] = diff;
  }

  return coldiff;
}

function divideDash(da1, da2, step) {
  let stDashlist = Array.isArray(da1) ? da1.slice(0) : [0];
  let tarDashlist = Array.isArray(da2) ? da2.slice(0) : [0];

  let last_ind = -1;
  if (tarDashlist.length > stDashlist.length && stDashlist.length % 2 !== 0) {
    if (stDashlist.length < 2) last_ind = 0;
    stDashlist.push(stDashlist[last_ind]);
  } else if (
    tarDashlist.length < stDashlist.length &&
    tarDashlist.length % 2 !== 0
  ) {
    if (tarDashlist.length < 2) last_ind = 0;
    tarDashlist.push(tarDashlist[last_ind]);
  }

  const dashdiff = {
    change: false,
    st: stDashlist,
    list: new Array(stDashlist.length),
  };

  dashdiff["list"].fill(0);

  const dLength =
    stDashlist.length <= tarDashlist.length
      ? stDashlist.length
      : tarDashlist.length;

  for (let dInd = 0; dInd < dLength; dInd++) {
    const lineDashdiff = (tarDashlist[dInd] - stDashlist[dInd]) * step;
    if (lineDashdiff !== 0) dashdiff["change"] = true;
    dashdiff["list"][dInd] = lineDashdiff;
  }

  return dashdiff;
}

function divideRoute(coord, pathAmount, st, end) {
  let p0 = coord[0];

  let pre = p0,
    disttot = 0,
    dist;
  (distList = []), (distIntervals = { change: true, list: [] });

  for (let i = 0, d = coord.length; i < d; i++) {
    dist = Math.sqrt(
      Math.pow(coord[i][0] - pre[0], 2) + Math.pow(coord[i][1] - pre[1], 2)
    );

    disttot += dist;
    distList.push(disttot);
    pre = coord[i];
  }

  const st1 = st[0],
    st2 = end[0],
    end1 = st[1],
    end2 = end[1];

  const stdiv = (st2 - st1) / pathAmount;
  const enddiv = (end2 - end1) / pathAmount;

  if (stdiv === 0 && enddiv === 0) {
    distIntervals["change"] = false;
  }

  let z = 0,
    d2 = distList.length,
    stPre = null,
    endPre = null;

  const partdiv = (z1, z2, dist) => {
    const sup = dist - distList[z1];
    const supdist = sup / (distList[z2] - distList[z1]);

    const x = coord[z1][0] + (coord[z2][0] - coord[z1][0]) * supdist;
    const y = coord[z1][1] + (coord[z2][1] - coord[z1][1]) * supdist;

    return [x, y];
  };

  for (let i = 0, d = pathAmount; i < d; i++) {
    distIntervals["list"][i] = new Array();

    stPre = null;
    endPre = null;
    let stPer = st1 + i * stdiv;
    let endPer = end1 + i * enddiv;

    let stdist = stPer * (disttot / 100);
    let enddist = endPer * (disttot / 100);

    for (z = 0; z < d2; z++) {
      if (distList[z] >= stdist) {
        if (stPre !== null) {
          if (stPer < endPer) {
            distIntervals["list"][i].push(partdiv(z, stPre, stdist));
            stPre = null;
          }
        }

        if (distList[z] <= enddist) {
          distIntervals["list"][i].push(coord[z]);
        } else {
          if (endPre !== null) {
            if (stPer < endPer) {
              distIntervals["list"][i].push(partdiv(endPre, z, enddist));
            }
          }
          break;
        }
      } else {
        stPre = z;
      }

      endPre = z;
    }
  }
  return distIntervals;
}

function createRoute() {
  routeframeDiv ? routeframeDiv.open() : (routeframeDiv = new Routeframe());
  return;
}

async function fetchRoute(url) {
  let fileRes = await fetch(url);
  fileRes = await fileRes.json();

  return fileRes;
}

async function createRouteLayer(coord, waypoints) {
  let feature = await new ol.format.GeoJSON().readFeature(
    {
      type: "Feature",
      geometry: { coordinates: coord, type: "LineString" },
      properties: {
        name: "Route",
      },
    },
    {
      featureProjection: "EPSG:3857",
    }
  );

  addRouteLayer(
    feature,
    coord.map((x) => ol.proj.fromLonLat(x)),
    waypoints.map((x) => ol.proj.fromLonLat(x))
  );
}

function mergeFeatures(Features) {
  let multiGeo = [],
    fea = null;

  for (let i = 0, d = Features.length; i < d; i++) {
    if (Features[i]) {
      multiGeo.push(Features[i].getGeometry());
      if (fea === null) fea = Features[i].clone();
    }
  }

  if (fea !== null) {
    fea.setGeometry(new ol.geom.GeometryCollection(multiGeo));
  }

  return fea;
}

function setAttributionText(text) {
  layersDict["lay"]["xyz"].getSource().setAttributions(text);
  layersDict["lay"]["xyz_ren"].getSource().setAttributions(text);
}

function setAttributionTextUrl(urlxyz) {
  setAttributionText(attributionText(urlxyz));
}

function attributionText(urlxyz) {
  try {
    let att = new URL(urlxyz).hostname;
    return att !== undefined && att !== null ? att : "";
  } catch (error) {
    layersDict["lay"]["xyz"].getSource().setAttributions("");
    layersDict["lay"]["xyz_ren"].getSource().setAttributions("");
    return "";
  }
}

function rearrangeData(datasetInd = null) {
  let i = 1;
  let dl = chartT.data.datasets.length;
  if (datasetInd !== null) {
    i = datasetInd;
    dl = datasetInd + 1;
  }

  for (let dataset; i < dl; i++) {
    dataset = chartT.data.datasets[i];

    let sortArray = [];
    let p = 0;
    for (let s of dataset.data) {
      sortArray.push([p, s.x]);
      p++;
    }
    sortArray.sort(function (a, b) {
      return a[1] - b[1];
    });

    p = 0;
    let end = sortArray.length - 1,
      nextN = null,
      endN = null,
      preN = null;

    let ch = chartDict["indexToName"][String(i)];
    for (let s of sortArray) {
      p < end ? (nextN = sortArray[p + 1][0]) : (nextN = null);
      dataset.data[s[0]].next = nextN;

      p != 0 ? (preN = sortArray[p - 1][0]) : (preN = null);
      dataset.data[s[0]].pre = preN;

      dataset.data[s[0]].real = p;
      dataset.data[s[0]].cur = s[0];
      p++;
    }

    sortedDict[ch]["start"] = nextN;
    sortedDict[ch]["end"] = endN;
    if (sortArray.length === 0) continue;
    nextN = sortArray[0][0];
    endN = sortArray[sortArray.length - 1][0];

    let z = 0;
    let zch = 0;

    sortedDict[ch]["start"] = nextN;
    sortedDict[ch]["end"] = endN;
    let tempdata = [];

    for (let s of sortArray) {
      let da = dataset.data[nextN];
      nextN = da.next;
      if (da.indexmap == null || da.indexmap == undefined) {
        zch++;
        continue;
      }

      let cm = da.indexmap;
      da.step = z;
      cm.set("step", z);

      if (da.layer === "map") {
        cm.setStyle(createStyle(`${z}`, cm.get("curstyle")));
      }
      tempdata.push(cm);
      zch++;
      z++;

      if (da.next === null) {
        break;
      }
    }

    markerDict[ch] = tempdata;
  }
  checkAllLines();
  chartT.update();
}

function compareDict(dict1, dict2) {
  const keys1 = Object.keys(dict1);
  const keys2 = Object.keys(dict2);
  if (keys1.length !== keys2.length) return false;

  for (let x of keys1) {
    if (dict1[x] !== dict2[x]) {
      return false;
    }
  }

  return true;
}

function compareArray(array1, array2) {
  if (array1.length !== array2.length) return false;
  for (let i = 0, n = array1.length; i < n; i++) {
    if (Array.isArray(array1[i]) && Array.isArray(array2[i])) {
      if (!compareArray(array1[i], array2[i])) return false;
    } else if (array1[i] !== array2[i]) return false;
  }

  return true;
}

const chartAreaBorder = {
  id: "chartAreaBorder",
  beforeDraw(chart, args, options) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    ctx.save();
    ctx.fillStyle = styleChart["main_pannel"];
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.strokeRect(left, top, width, height);

    ctx.restore();
  },
};

let searchTimeout;

function searchPlace(e, par = null) {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchHandler(e, par);
  }, 500);
}

function framesX(x) {
  const oldx = chartT.options.scales.x.max;
  chartT.options.scales.x.max = x;
  return oldx;
}

function durationResize(val) {
  let xmax = val;
  for (let ch of Object.keys(sortedDict)) {
    let ind = chartDict["indexToData"][ch];
    if (Number.isInteger(sortedDict[ch].end)) {
      xmax = Math.max(
        xmax,
        chartT.data.datasets[ind].data[sortedDict[ch].end].x -
          chartT.options.plugins.dragData.offsetmaxX
      );
    }
  }
  framesX(xmax);
  checkTimeMarker();

  chartT.update();

  framesDurationInput.value = xmax;
  timeseq.exportResize();
}

function changeDuration(e) {
  if (e.keyCode === 13) {
    let val = parseInt(e.target.value);
    if (val) {
      durationResize(val);
    } else {
      e.target.value = chartT.options.scales.x.max;
    }
  }
}

function changeFrame_s(e) {
  if (e.keyCode === 13) {
    if (parseInt(e.target.value)) {
      timeseq.frame_s = parseInt(e.target.value);

      checkTimeMarker();
      chartT.update();
      timeseq.exportResize();
    } else {
      e.target.value = timeseq.frame_s;
    }
  }
}

function searchHandler(e, par = null) {
  const searchContEl = document.getElementById(e.target.parentNode.id);

  function removeTable() {
    searchContEl.querySelectorAll("td").forEach((el) => el.remove());
    searchContEl.querySelectorAll("table").forEach((el) => el.remove());
  }
  if ((e.target.value.length < 3 && e.keyCode !== 13) || !e.target.value) {
    removeTable();
    return;
  }

  let url = "https://photon.komoot.io/api/";
  let params = {
    q: encodeURIComponent(e.target.value),
    limit: "5",
  };

  url = url + "?";
  Object.keys(params).forEach(function (key) {
    url += "&" + key + "=" + params[key];
  });
  fetch(url)
    .then((response) => response.json())
    .then((response) => nextList(response.features));

  function nextList(res) {
    removeTable();
    if (!res) return;
    if (res.length === 0) return;

    let contEl = document.createElement("table");
    for (let fea of res) {
      let row = contEl.insertRow(-1);
      let cell = row.insertCell(-1);
      cell.innerHTML = fea.properties.name + `  [${fea.properties.type}]`;
      cell.onclick = (el) => {
        removeTable();
        e.target.value = fea.properties.name;
        viewT.setCenter(toCenter(fea.geometry.coordinates));

        if (par) {
          par.confirm(fea);
        } else {
          viewT.setZoom(9);
        }
      };
    }
    searchContEl.appendChild(contEl);
  }
}

function handleClickEvents() {
  rearrangeData();
}

function checkProgressEl() {
  timeseq.progressEl.height = canv.height;
  timeseq.progressEl.width = canv.width;
  timeseq.progressEl.style.height = canv.style.height;
  timeseq.progressEl.style.width = canv.style.width;
}

function progressPre(chart) {
  try {
    const { boxes, chartArea } = chart;
    const ctx = timeseq.progressEl.getContext("2d");

    let box_y = 3,
      box_x = 4;
    for (let i in boxes) {
      if (boxes[i].hasOwnProperty("id")) {
        if (boxes[i]["id"] == "y") box_y = i;
        if (boxes[i]["id"] == "x") box_x = i;
      }
    }
    if (boxes[box_x]._gridLineItems.length !== boxes[box_x].ticks.length)
      return;
    if (
      boxes[box_x]._gridLineItems.length <= 1 ||
      1 >= boxes[box_x].ticks.length
    )
      return;
    ctx.save();
    let px_frame = chartArea.width;

    let arr = [];
    for (let t = 0, n = boxes[box_x].ticks.length; t < n; t++) {
      arr.push([
        boxes[box_x]._gridLineItems[t].x1,
        boxes[box_x].ticks[t].value,
      ]);
    }

    const style_grey = "rgba(122, 122, 122, 0.7)";
    const style_green = "rgba(38, 148, 47, 0.7)";
    ctx.clearRect(0, 0, timeseq.progressEl.width, timeseq.progressEl.height);
    if (compareArray(arr, timeseq.playPos.gridLine)) {
      for (let t = 0, n = timeseq.playPos.data.length; t < n; t++) {
        if (t + 1 < n)
          px_frame = timeseq.playPos.data[t + 1] - timeseq.playPos.data[t];
        ctx.fillStyle = style_grey;
        if (timeseq.seq["frames"][t]) ctx.fillStyle = style_green;
        ctx.fillRect(timeseq.playPos.data[t], chartArea.top, px_frame, 10);
      }
    } else {
      timeseq.playPos.data = [];
      timeseq.playPos.gridLine = [];

      for (let t = 1, n = arr.length; t < n; t++) {
        let begctx = arr[t - 1][0];
        let begvalue = arr[t - 1][1];
        let width = arr[t][0] - begctx;
        let diff = arr[t][1] - begvalue;
        if (width <= 0 || diff <= 0) continue;

        px_frame = width / diff;
        for (let i = 0, d = diff; i < d; i++) {
          let x = begctx + i * px_frame;
          timeseq.playPos.data.push(x);

          ctx.fillStyle = style_grey;
          if (timeseq.seq["frames"][i + begvalue]) ctx.fillStyle = style_green;
          ctx.fillRect(x, chartArea.top, px_frame, 10);
        }
      }
      for (let x of arr) {
        timeseq.playPos.gridLine.push(x.slice(0));
      }
    }
    if (Number.isInteger(timeseq.playPos.preFrame)) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        timeseq.playPos.data[timeseq.playPos.preFrame],
        chartArea.top,
        2,
        chartArea.height
      );
    }
    ctx.restore();
  } catch (error) {}
}

function drawPannel(chart) {
  const { ctx } = chart;
  let box_y = 3,
    box_x = 4;
  for (let i in chart.boxes) {
    if (chart.boxes[i].hasOwnProperty("id")) {
      if (chart.boxes[i]["id"] == "y") box_y = i;
      if (chart.boxes[i]["id"] == "x") box_x = i;
    }
  }

  ctx.save();

  let ygrid;
  let la = [];

  ctx.restore();

  if (chart.chartArea.left > 0) {
    canvCon.style["margin-left"] = chart.chartArea.left * -1 + "px";
  }
  const canvHeight = parseInt(canvWrapper.getBoundingClientRect().height);
  const canvWidth = 150;
  canvSel.style.height = canvHeight + "px";
  canvSel.style.width = canvWidth + "px";

  canvSel.height = parseInt(canvSel.style.height) * 1;
  canvSel.width = parseInt(canvSel.style.width) * 1;

  const panoff = 10;
  canvSelCtx.save();
  canvSelCtx.fillStyle = styleChart["main_pannel"];
  canvSelCtx.fillRect(0, 0, canvSel.width, canvSel.height);

  canvSelCtx.font = "16px serif";
  for (let i in chart.boxes[box_y]._gridLineItems) {
    if (i == 0 || chart.boxes[box_y]._gridLineItems.length - 1 == i) {
      la.push(chart.boxes[box_y]._gridLineItems[i]["y1"]);
      continue;
    }
    ygrid = chart.boxes[box_y]._gridLineItems[i]["y1"];
    la.push(ygrid);
  }
  let z = 0;
  la.reverse();

  for (let i in layersDict["panel"]) {
    delete layersDict["panel"][i];
  }
  layersDict["panel"] = [];

  canvSelCtx.fillStyle = styleChart["main_inner"];
  canvSelCtx.fillRect(10, la[0], canvSel.width - 10, la[la.length - 1] - la[0]);

  for (let i = 0, n = chart.config._config.data.datasets.length; i < n; i++) {
    dataset = chart.config._config.data.datasets[i];
    if (dataset.use === false) continue;
    let ch = chartDict["indexToName"][String(i)];

    canvSelCtx.font = "16px serif";
    canvSelCtx.fillStyle = "black";
    canvSelCtx.fillText(ch, 20, la[z] - (la[z] - la[z + 1]) / 2 - 13);
    let boxEl = {
      id: ch,
      num: z,
      pos: {
        x: panoff,
        y: la[z],
        w: canvSel.width - panoff,
        h: la[z + 1] - la[z],
      },
      elem: [],
    };

    let elem = {
      class: "button",
      func: "add",
      pos: {
        x: canvSel.width - 96,
        y: la[z + 1] - 35,
        w: 92,
        h: 30,
      },
    };
    boxEl["elem"].push(elem);
    layersDict["panel"].push(boxEl);

    canvSelCtx.lineWidth = 2;
    canvSelCtx.strokeRect(...Object.values(elem["pos"]));

    canvSelCtx.fillStyle = styleChart["main_button"];
    canvSelCtx.fillRect(...Object.values(elem["pos"]));
    canvSelCtx.fillStyle = "black";
    elem = null;

    canvSelCtx.font = "16px serif";
    canvSelCtx.fillText("add keyframe", canvSel.width - 93, la[z + 1] - 17);

    if (z > 0) {
      canvSelCtx.fillRect(panoff, la[z], canvSel.width - panoff, 1);
    }
    z++;
  }
  canvSelCtx.strokeStyle = "black";
  canvSelCtx.lineWidth = 1;
  canvSelCtx.strokeRect(
    10,
    la[0],
    canvSel.width - 10,
    la[la.length - 1] - la[0]
  );

  canvSelCtx.restore();
  resizeEW.style.height = chart.chartArea.height + "px";
  resizeEW.style.top = chart.chartArea.top + "px";
}

const chartLabel = {
  id: "chartLabel",

  afterDraw(chart, args, options) {
    const { chartArea } = chart;

    if (!compareDict(chartArea, timeseq.playPos.chartArea)) {
      if (chartSizeDict["init"] === false) {
        chartSizeDict["add"] = chartArea.height;
        chartSizeDict["init"] = true;
      }

      checkProgressEl();
      drawPannel(chart);
      timeseq.progressBarDraw(chart);
      for (let key of Object.keys(chartArea)) {
        timeseq.playPos.chartArea[key] = chartArea[key];
      }
    }
  },

  beforeEvent(chart, args, options) {
    let event = args.event;
    switch (event.type) {
      case "click":
        handleClickEvents();
        break;
    }
  },
};

function checkbox(e, box, margin = 1) {
  let hcheck = false;
  hcheck = !(
    e[0] < box.x - margin ||
    e[1] < box.y - margin ||
    e[0] > box.x + box.w + margin ||
    e[1] > box.y + box.h + margin
  );

  return hcheck;
}

function panelHandeler(e) {
  for (let i of layersDict["panel"]) {
    if (checkbox([e.offsetX, e.offsetY], i["pos"], 0)) {
      for (let z of i["elem"]) {
        if (checkbox([e.offsetX, e.offsetY], z["pos"])) {
          switch (z.func) {
            case "add":
              addFromPanel(i.id);
              break;
          }
          break;
        }
      }
      break;
    }
  }
}

let options = {
  type: "scatter",
  data: {
    datasets: [
      {
        use: false,
        data: [
          {
            x: 7,
            y: 0,
          },
          {
            x: 7,
            y: 2,
          },
        ],
        backgroundColor: "black",
        pointStyle: "rectRot",
        radius: 8,
        hoverRadius: 12,
        borderColor: "black",
        borderWidth: 4,
        fill: false,
        showLine: true,
      },
    ],
  },

  options: {
    layout: {},
    animations: false,
    maintainAspectRatio: false,
    scales: {
      y: {
        max: 2,
        min: 0,
        ticks: {
          stepSize: 2,
          display: false,
        },
        grid: {
          drawTicks: false,
          color: "#000000",
        },
      },
      x: {
        max: 45,
        min: 0,
        position: "top",
        ticks: {
          color: function (value) {
            let col = "black";
            if (!(value.tick.value % timeseq.frame_s)) col = "white";
            return col;
          },
          callback: function (value, index, values) {
            let remainder = value % timeseq.frame_s;
            let quotient = (value - remainder) / timeseq.frame_s;
            let unit = " f";

            return quotient + ":" + remainder + unit;
          },
          maxRotation: 0,
          maxTicksLimit: 15,
          precision: 0,
          autoSkipPadding: 0,
          align: "start",
        },
      },
    },
    responsive: false,
    onHover: function (e) {
      const point = e.chart.getElementsAtEventForMode(
        e,
        "nearest",
        {
          intersect: true,
        },
        false
      );
      if (point.length) e.native.target.style.cursor = "grab";
      else e.native.target.style.cursor = "default";
    },
    plugins: {
      legend: {
        display: false,
        position: "left",
      },
      tooltip: {
        callbacks: {
          label: (el) => {
            return "f " + el.parsed.x;
          },
        },
      },
      dragData: {
        round: 0,
        maxY: 1,
        minY: 1,
        minX: 0,
        offsetmaxX: -1,

        dragX: true,
        dragY: false,
        showTooltip: true,
        onDragStart: function (e, datasetIndex, index, value) {
          rearrangeData();
          selectChar(datasetIndex, index);
        },
        onDrag: function (e, datasetIndex, index, value) {
          if (datasetIndex === 0) {
            let i = 0;
            chartT.data.datasets[datasetIndex].data.forEach((dataset) => {
              if (index != i) {
                chartT.data.datasets[datasetIndex].data[i].x =
                  chartT.data.datasets[datasetIndex].data[index].x;
              }
              i++;
            });
            timeseq.previewStartMarker();
          } else {
            let tempD = [null, null];
            let curdata = chartT.data.datasets[datasetIndex].data[index];
            tempD[0] = curdata.pre;
            tempD[1] = curdata.next;

            let mapCheck = false;
            if (chartDict["indexToName"][datasetIndex] === "map")
              mapCheck = true;

            let mid, tempX;
            for (let i = 0, n = tempD.length; i < n; i++) {
              if (i == 0 && tempD[i] !== null && tempD[i] !== undefined) {
                tempX = chartT.data.datasets[datasetIndex].data[tempD[i]].x;
                if (curdata.x < tempX) {
                  rearrangeData(datasetIndex);
                  break;
                } else if (mapCheck) {
                  if (curdata.lines.pre) {
                    mid = curdata.lines.pre.get("mid");
                    if (mid) {
                      if (curdata.x - 1 <= tempX || mid.get("bez")) {
                        setLine(curdata.lines.pre);
                      }
                    } else {
                      if (curdata.x - 1 > tempX) {
                        setLine(curdata.lines.pre);
                      }
                    }
                  }
                }
              } else if (
                i == 1 &&
                tempD[i] !== null &&
                tempD[i] !== undefined
              ) {
                tempX = chartT.data.datasets[datasetIndex].data[tempD[i]].x;
                if (curdata.x > tempX) {
                  rearrangeData(datasetIndex);
                  break;
                } else if (mapCheck) {
                  if (curdata.lines.next) {
                    mid = curdata.lines.next.get("mid");
                    if (mid) {
                      if (curdata.x + 1 >= tempX || mid.get("bez")) {
                        setLine(curdata.lines.next);
                      }
                    } else {
                      if (curdata.x + 1 < tempX) {
                        setLine(curdata.lines.next);
                      }
                    }
                  }
                }
              }
            }
          }
        },
        onDragEnd: function (e, datasetIndex, index, value) {
          e.target.style.cursor = "default";
        },
      },
      chartAreaBorder: {
        borderColor: "black",
      },
    },
  },
  plugins: [chartAreaBorder, chartLabel],
};

function addSetGet(data, temp) {
  for (let key of Object.keys(temp)) {
    data["_" + key] = temp[key];

    Object.defineProperty(data, key, {
      set: (v) => {
        let change = false;
        if (data["_" + key] !== v) {
          change = true;
        } else if (typeof v === "object") {
          if (Array.isArray(v)) {
            if (!compareArray(v, data["_" + key])) {
              change = true;
            }
          }
        }
        if (change) timeseq.exportNew();
        data["_" + key] = v;
      },
      get: () => {
        return data["_" + key];
      },
    });
  }
  return data;
}

function optionlayer(opt = {}) {
  let optdata = addSetGet({}, opt);

  let data = {
    label: "keyframe",
    borderColor: "black",
    use: true,
    data: [],
    borderWidth: 1,
    backgroundColor: function (el) {
      if (el.datasetIndex === curSelChar[0] && el.index === curSelChar[1]) {
        return "blue";
      } else {
        return "white";
      }
    },
    pointStyle: "rectRot",
    radius: 13,
    hoverRadius: 17,
    hitRadius: 0,
    showLine: true,
  };
  for (let key of Object.keys(data)) {
    if (!optdata.hasOwnProperty(key)) {
      optdata[key] = data[key];
    }
  }

  return optdata;
}

let chartT = new Chart(ctx, options);

function zoomWheel(e) {
  e.preventDefault();

  let stepscale = e.deltaY * -0.001;
  let newScale = scaleView;
  newScale += e.deltaY * -0.001;
  if (e.deltaY < 0) newScale *= 1.2;
  else if (e.deltaY > 0) newScale /= 1.2;
  newScale = Math.max(0.125, newScale);
  let newWidth = orgCanvWidth * newScale;
  newWidth > 29000 ? (newWidth = 29000) : (scaleView = newScale);

  canvCon.style.width = `${newWidth}px`;
  chartT.options.scales.x.ticks.maxTicksLimit = Math.max(
    chartT.options.scales.x.max * 10,
    15
  );
  chartT.update();
  chartT.resize();
}

function mouseDownEv(e) {
  last_resizepos = e.clientX;
  last_resizeX = chartT.options.scales.x.max;
  canv.style["pointer-events"] = "none";
  window.addEventListener("mousemove", Resizemv, false);
  window.addEventListener("mouseup", Resizestop, false);
}

function setZlayers(val) {
  layersDict["lay"]["track"].setZIndex(val);
  layersDict["lay"]["line"].setZIndex(val);
  layersDict["lay"]["bez"]["point"].setZIndex(val);
  layersDict["lay"]["map"].setZIndex(val + 1);
  layersDict["lay"]["sel"].setZIndex(val + 1);
}

function renAdjustRes(e) {
  if (e.keyCode === 13) {
    let previewRes = [960, 540];
    let sizeMap = map.getSize();
    let mapRes = [640, 360];
    const mapstyle = ["width", "height"];
    const ind =
      e.target.id === "renWidthIn"
        ? 0
        : e.target.id === "renHeightIn"
        ? 1
        : null;
    const val = parseInt(e.target.value);
    if (timeseq.renderRes[ind] !== val) {
      timeseq.renderRes[ind] = val;
      let ind2 = Math.abs(ind - 1);
      let ratioRen = timeseq.renderRes[ind2] / timeseq.renderRes[ind];
      if (ratioRen !== sizeMap[ind2] / sizeMap[ind]) {
        if (mapRes[ind] * ratioRen <= mapRes[ind2]) {
          mapRes[ind2] = mapRes[ind] * ratioRen;
        } else {
          mapRes[ind] = mapRes[ind2] / ratioRen;
        }

        mapDOM.style[mapstyle[ind2]] = mapRes[ind2] + "px";
        mapDOM.style[mapstyle[ind]] = mapRes[ind] + "px";
        map.setSize(mapRes);
      }

      if (ratioRen !== timeseq.previewRes[ind2] / timeseq.previewRes[ind]) {
        if (previewRes[ind] * ratioRen <= previewRes[ind2]) {
          previewRes[ind2] = previewRes[ind] * ratioRen;
        } else {
          previewRes[ind] = previewRes[ind2] / ratioRen;
        }
      }

      if (val < previewRes[ind]) {
        const scalePre = previewRes[ind] / val;
        previewRes[ind] /= scalePre;
        previewRes[ind2] /= scalePre;
      }

      timeseq.previewRes = previewRes;

      previewCanvas.width = previewRes[0];
      previewCanvas.height = previewRes[1];

      previewCanvas.style.width = previewRes[0] + "px";
      previewCanvas.style.height = previewRes[1] + "px";
      timeseq.exportNew();
    }
  }
}

function Resizemv(e) {
  if (last_resizepos === null || last_resizeX === null) return;

  const diff = e.clientX - last_resizepos;
  const xmax = Math.max(Math.round(last_resizeX + diff * 0.5), 1);
  durationResize(xmax);
}

function Resizestop(e) {
  last_resizepos = null;
  last_resizeX = null;
  canv.style["pointer-events"] = "auto";
  window.removeEventListener("mousemove", Resizemv, false);
  window.removeEventListener("mouseup", Resizestop, false);

  checkProgressEl();
  timeseq.progressBarDraw(chartT);
}

function moveEl(el) {
  this.x = null;
  this.y = null;

  this.xEl = el.offsetLeft;
  this.yEl = el.offsetTop;

  const resizeKeywords = ["both", "horizontal", "vertical", "block", "inline"];

  el.addEventListener("mousedown", (e) => {
    this.mouseDownEv(e);
  });

  this.mouseDownEv = (e) => {
    let marginResize = 30;

    this.x = e.clientX;
    this.y = e.clientY;

    this.xEl = el.offsetLeft;
    this.yEl = el.offsetTop;

    canv.style["pointer-events"] = "none";

    for (let key of resizeKeywords) {
      if (window.getComputedStyle(el)["resize"] == key) {
        if (
          this.x - this.xEl + marginResize >= el.offsetWidth &&
          this.y - this.yEl + marginResize >= el.offsetHeight
        ) {
          return;
        }
      }
    }

    window.addEventListener("mousemove", this.move, false);
    window.addEventListener("mouseup", this.stop, false);
  };

  this.move = (e) => {
    if (this.x === null || this.y === null) return;

    el.style["margin"] = "0px";

    el.style.left = this.xEl + (e.clientX - this.x) + "px";
    el.style.top = this.yEl + (e.clientY - this.y) + "px";
  };

  this.stop = (e) => {
    canv.style["pointer-events"] = "auto";
    window.removeEventListener("mousemove", this.move, false);
    window.removeEventListener("mouseup", this.stop, false);
  };
}

canv.addEventListener("wheel", zoomWheel);
resizeEW.addEventListener("mousedown", mouseDownEv);
previewButton.addEventListener("click", previewClick);
previewSwitchButton.addEventListener("click", previewcalc);
sourceButton.addEventListener("click", creatElGeoSource);
trackButton.addEventListener("click", createTrackPoint);
routeButton.addEventListener("click", createRoute);

zoomInput.addEventListener("keyup", changeInput);
xInput.addEventListener("keyup", changeInput);
yInput.addEventListener("keyup", changeInput);
rotationInput.addEventListener("keyup", changeInput);

searchInput.addEventListener("keyup", searchPlace);
framesDurationInput.addEventListener("keyup", changeDuration);
frames_sInput.addEventListener("keyup", changeFrame_s);

renWidthInput.addEventListener("keyup", renAdjustRes);
renHeightInput.addEventListener("keyup", renAdjustRes);

addButton.addEventListener("click", addMarker);
moveButton.addEventListener("click", moveMarker);

playButton.addEventListener("click", previewHandler);
timeseq.playButtons.push(playButton);
downloadButton.addEventListener("click", renderHandler);

window.addEventListener("keyup", deleteMarker);
delButton.addEventListener("click", deleteMarker);

canvSel.addEventListener("click", panelHandeler);

function createSourceMap() {
  mapSourceType = "xyz";
  return new ol.source.XYZ({
    crossOrigin: "anonymous",
  });
}

function main_start() {
  const urlxyz = XYZURLS[0].url(XYZURLS[0].list[0]);

  defaultLay["map"]["xyz"] = urlxyz;
  chartT.data.datasets.push(new optionlayer());
  rearrangeData();

  chartSizeDict["init"] = false;
  canvCon.style.width = `500px`;
  canvCon.style.height = chartSizeDict["beg"] + "px";
  canvCon.width = 500;
  canvCon.height = chartSizeDict["beg"];

  chartT.resize();
  orgCanvWidth = parseInt(canvCon.style.width);
  orgCanvHeight = parseInt(canvCon.style.height);

  framesDurationInput.value = chartT.options.scales.x.max;
  let tileLayer = new ol.layer.Tile({
    source: new createSourceMap(),
  });

  let tileLayerRen = new ol.layer.Tile({
    className: "ol-layer-export layer_map",
    zIndex: 0,
    source: new createSourceMap(),
  });

  let markerTimeSource = new ol.source.Vector({
    features: [],
  });

  let markerTimeLayer = new ol.layer.Vector({
    source: markerTimeSource,
    title: "map",
    zIndex: 2,
  });

  let markerSelectSource = new ol.source.Vector({
    features: [],
  });

  let markerSelectLayer = new ol.layer.Vector({
    source: markerSelectSource,
    title: "select",
    zIndex: 2,
    opacity: 0.0,
  });

  let markerTrackSource = new ol.source.Vector({
    features: [],
  });

  let markerTrackLayer = new ol.layer.Vector({
    source: markerTrackSource,
    title: "track",
    zIndex: 1,
  });

  let markerLineSource = new ol.source.Vector({
    features: [],
  });

  let markerLineLayer = new ol.layer.Vector({
    source: markerLineSource,
    title: "Line",
    zIndex: 1,
  });

  let markerbezSource = new ol.source.Vector({
    features: [],
  });

  let markerbezLayer = new ol.layer.Vector({
    source: markerbezSource,
    title: "bez",
    zIndex: 1,
  });

  layersDict["lay"]["xyz"] = tileLayer;
  layersDict["lay"]["xyz_ren"] = tileLayerRen;

  layersDict["lay"]["map"] = markerTimeLayer;
  layersDict["lay"]["sel"] = markerSelectLayer;
  layersDict["lay"]["line"] = markerLineLayer;
  layersDict["lay"]["track"] = markerTrackLayer;
  layersDict["lay"]["bez"]["point"] = markerbezLayer;

  map.addLayer(tileLayer);
  mapRender.addLayer(tileLayerRen);

  map.addLayer(markerTimeLayer);
  map.addLayer(markerSelectLayer);
  map.addLayer(markerLineLayer);
  map.addLayer(markerTrackLayer);
  map.addLayer(markerbezLayer);

  const translate = new ol.interaction.Translate({
    layers: [markerSelectLayer],
    features: markerSelectLayer.getSource().getFeaturesCollection(),
  });
  map.addInteraction(translate);
  translate.on("translating", translatingHandler);
  translate.on("translateend", translateendHandler);

  if (mapSourceType === "xyz") {
    tileLayer.getSource().setUrl(urlxyz);
    tileLayerRen.getSource().setUrl("");

    setAttributionTextUrl(urlxyz);
  }

  previewCanvas.width = timeseq.previewRes[0];
  previewCanvas.height = timeseq.previewRes[1];
  previewCanvas.style.width = timeseq.previewRes[0] + "px";
  previewCanvas.style.height = timeseq.previewRes[1] + "px";
}

document.addEventListener("readystatechange", (ev) => {
  if (ev.target.readyState === "complete") {
    main_start();
  }
});
