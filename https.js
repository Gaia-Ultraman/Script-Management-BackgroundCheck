const https = require('https');
const fs = require('fs');

var crypto = require('crypto');

const httpsPort = 3423;

const options = {
  key: fs.readFileSync(__dirname + '/ssl/privkey.pem').toString(),
  cert: fs.readFileSync(__dirname + '/ssl/cert.pem').toString(),
  ca: [fs.readFileSync(__dirname + '/ssl/client.cer').toString()],
  requestCert: true,  
  rejectUnauthorized: true,
  passphrase: 'Jiawei19294' 
};

var httpsObj = https.createServer(options, (req, res) => {
  var postData = '';
  var ip=req.headers['x-forwarded-for'] || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
  
  req.on('data', function (chunk) {
    postData += chunk;
  });

  req.on('end', function () {
    let device;
    try {
      device=JSON.parse(postData);
    } catch (e) {
      res.end("NO");
      datadb.run("IF EXISTS (SELECT 1 FROM 异常信息 WHERE IP地址=?)\
                  UPDATE 异常信息 SET 访问时间=datetime(CURRENT_TIMESTAMP,'localtime'),错误信息=消息格式错误  WHERE IP地址=?\
                ELSE\
                  INSERT INTO 表名(IP地址,访问时间,错误信息) VALUES(?,datetime(CURRENT_TIMESTAMP,'localtime'),消息格式错误)"
      ,ip,ip,ip)
      return;
    }
    datadb.get("select * from 设备信息 where 序列号=?", device.SerialNumber, function (err, row) {
      if (row ) {
        //先判断是否到期，如果到期就返回NO
        //查询的条例中是否有UDID，如果有就与提交数据的UDID比较（比较结果不同，保存异常返回NO并保存原和现有UDID,序列号。相同就返回YES）   如果没有就保存返回YES
        // 
        datadb.get("select * from 设备信息 where 序列号=? AND UDID=?", device.SerialNumber,device.UniqueDeviceID, function (UDIDErr, UDIDRow) {
          

        })

      }
      else{
        //添加IP地址 UDID 序列号 当前访问的时间 到期时间(现在的日期+30天) 
      }


    })

    

    
    console.log(postData)
    res.writeHead(200);
    res.end("YES");
  });
})


//禁止重协商
httpsObj.CLIENT_RENEG_LIMIT = 0

httpsObj.listen(httpsPort, () => {
  console.log(`running server https://127.0.0.1:${httpsPort}`)
})
httpsObj.on('secureConnection', (socket) => {
  if (!socket.authorized){
    datadb.run("IF EXISTS (SELECT 1 FROM 异常信息 WHERE IP地址=?)\
                  UPDATE 异常信息 SET 访问时间=datetime(CURRENT_TIMESTAMP,'localtime'),错误信息=ssl证书验证失败  WHERE IP地址=?\
                ELSE\
                  INSERT INTO 表名(IP地址,访问时间,错误信息) VALUES(?,datetime(CURRENT_TIMESTAMP,'localtime'),拒绝提供ssl证书)"
    ,socket.remoteAddress,socket.remoteAddress,socket.remoteAddress)     
  }
})
httpsObj.on('tlsClientError', (err, socket) => {
  if (err.code == 'ERR_SSL_PEER_DID_NOT_RETURN_A_CERTIFICATE') {
    console.log('客户端拒绝提供ssl证书')
  }
});

