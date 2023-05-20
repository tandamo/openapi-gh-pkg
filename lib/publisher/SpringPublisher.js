"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OpenApiGenerator_1 = __importDefault(require("../service/OpenApiGenerator"));
const Constants_1 = __importDefault(require("../utils/Constants"));
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const FileService_1 = require("../service/FileService");
const execute_1 = require("../utils/execute");
class SpringPublisher {
    static publish(artifact, group, version) {
        return __awaiter(this, void 0, void 0, function* () {
            yield OpenApiGenerator_1.default.generate({
                input: Constants_1.default.SCHEMA_FILE_PATH,
                output: Constants_1.default.DEPLOYMENT_SPRING,
                generator: Constants_1.default.DEPLOYMENT_SPRING,
                additionalProperties: [
                    `artifactId=${artifact}`,
                    `artifactVersion=${version}`,
                    `groupId=${group}`,
                    `apiPackage=${group}.api`,
                    `modelPackage=${group}.model`,
                    `invokerPackage=${group}.api`,
                    `interfaceOnly=true`,
                ],
                gitUserId: github.context.repo.owner,
                gitRepoId: github.context.repo.repo,
            });
            core.notice(`${Constants_1.default.DEPLOYMENT_SPRING} Creation complete`);
            var pom = yield FileService_1.FileService.read(Constants_1.default.DEPLOYMENT_SPRING + "/pom.xml");
            pom = pom
                .replace("</project>", Constants_1.default.POM_DISTRIBUTION(github.context.repo.owner, github.context.repo.repo))
                .replace("</properties>", Constants_1.default.POM_PROPERTIES);
            yield FileService_1.FileService.write(Constants_1.default.DEPLOYMENT_SPRING + "/pom.xml", pom);
            core.notice(`${Constants_1.default.DEPLOYMENT_SPRING} POM file updated`);
            yield SpringPublisher.createSettingsXML();
            core.notice(`${Constants_1.default.DEPLOYMENT_SPRING} Settings file created`);
            yield SpringPublisher.publishCommand();
            core.notice(`${Constants_1.default.DEPLOYMENT_SPRING} Published`);
        });
    }
    static createSettingsXML() {
        return __awaiter(this, void 0, void 0, function* () {
            yield FileService_1.FileService.write(Constants_1.default.DEPLOYMENT_SPRING + "/settings.xml", Constants_1.default.SETTINGS_XML(github.context.repo.owner, Constants_1.default.DEPLOY_TOKEN));
        });
    }
    static publishCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, execute_1.execute)(`cd ${Constants_1.default.DEPLOYMENT_SPRING}; mvn deploy --settings settings.xml -DskipTests`);
        });
    }
}
exports.default = SpringPublisher;
