var sqlite3 = require('sqlite3').verbose();
var datadb = new sqlite3.Database(__dirname+'/云控验证信息.db');
datadb.run("CREATE TABLE IF NOT EXISTS 异常信息(IP地址 varchar,访问时间 varchar,错误信息 varchar)");
datadb.run("CREATE TABLE IF NOT EXISTS 设备信息(序列号 varchar,UDID varchar,IP地址 varchar,访问时间 varchar,到期时间 INT)");
export function 