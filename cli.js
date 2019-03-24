let axios = require("axios");
let fs = require("fs");
let day = require('dayjs');
let _ = require('lodash');
let jsonFormat = require('json-format');

let defaultMapKey = { QQMapKey:'' };

let QQMapKey = ''
try{
  QQMapKey = require('./QQMapKey.json').QQMapKey;
}catch(e){
  fs.writeFileSync(__dirname + "/QQMapKey.json",jsonFormat(defaultMapKey));
}

if(!QQMapKey){
  console.error('请在 QQMapKey.json 中填入腾讯地图开发密钥');
  process.exit()
}

let url = "http://apis.map.qq.com/ws/district/v1/list?key=" + QQMapKey;

let oldChinaCityCode = {
  updateDate:'',
  codeMap:{}
};

try{
  oldChinaCityCode = require('./districtsQQmap.json')
}catch(e){
  oldChinaCityCode = {
    updateDate:'',
    codeMap:{}
  };
}
let chinaCityCode = _.cloneDeep(oldChinaCityCode);

axios.get(url).then(({data,headers})=>{
  // data = res.data;
  if(data.status != 0){
    throw Error(data.message)
  }

  chinaCityCode.updateDate = day(headers.date).format('YYYY-MM-DD HH:mm:ss')

  let { result:[province,city,zone] } = data;

  province.forEach((item)=>{
    chinaCityCode.codeMap[item.id] = item.fullname;
  })
  city.forEach((item)=>{
    chinaCityCode.codeMap[item.id] = item.fullname;
  })
  zone.forEach((item)=>{
    chinaCityCode.codeMap[item.id] = item.fullname;
  })
  
  if(!_.isEqual(oldChinaCityCode.codeMap,chinaCityCode.codeMap)){

    fs.writeFile(__dirname + "/districtsQQmap.min.json", JSON.stringify(chinaCityCode),  (err) => {
      if (err) throw err;
    });

    fs.writeFile(__dirname + "/districtsQQmap.json",jsonFormat(chinaCityCode),  (err) => {
      if (err) throw err;
    });
      
  }else{
      console.log('行政区域信息没有更新');
  }

}).catch((error)=>{
    console.log(error)
})
