-- demo-fix.sql
-- Cap nhat dap an 4 cau do Chuong 1 (1, 2, 4, 8) khop ma thao tac game.js gui len server.
-- Chay file nay trong HeidiSQL (Laragon) tren database qua_den dang co.

USE qua_den;

UPDATE CAU_DO SET dap_an = 'xuong,trai' WHERE ma_cau_do = 1;
UPDATE CAU_DO SET dap_an = '9' WHERE ma_cau_do = 2;
UPDATE CAU_DO SET dap_an = 'nac5,vach2' WHERE ma_cau_do = 4;
UPDATE CAU_DO SET dap_an = '2' WHERE ma_cau_do = 8;
