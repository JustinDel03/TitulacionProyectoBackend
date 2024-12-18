"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validaTokenJwt = void 0;
const methods_helpers_1 = require("../helpers/methods.helpers");
const message_helpers_1 = require("../helpers/message.helpers");
const validaTokenJwt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers['authorization'];
    console.log("Token que llega del frontend: ", token);
    if (token) {
        const tokenValidate = (0, methods_helpers_1.validateJwt)(token);
        if (tokenValidate) {
            req.headers['datos'] = JSON.stringify(tokenValidate);
            next();
        }
        else {
            return (0, methods_helpers_1.responseService)(401, null, message_helpers_1.messageRespone["tokenExpire"], true, res);
        }
    }
    else {
        return (0, methods_helpers_1.responseService)(401, null, message_helpers_1.messageRespone["401"], true, res);
    }
});
exports.validaTokenJwt = validaTokenJwt;
