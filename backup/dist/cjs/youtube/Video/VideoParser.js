"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoParser = void 0;
const common_1 = require("../../common");
const BaseVideo_1 = require("../BaseVideo");
const Comment_1 = require("../Comment");
class VideoParser {
    static loadVideo(target, data) {
        var _a, _b, _c;
        const videoInfo = BaseVideo_1.BaseVideoParser.parseRawData(data);
        target.duration = 100;
        const itemSectionRenderer = (_a = data.response.contents.twoColumnWatchNextResults.results.results.contents
            .reverse()
            .find((c) => c.itemSectionRenderer)) === null || _a === void 0 ? void 0 : _a.itemSectionRenderer;
        target.comments.continuation = common_1.getContinuationFromItems((itemSectionRenderer === null || itemSectionRenderer === void 0 ? void 0 : itemSectionRenderer.contents) || []);
        const chapters = (_c = (_b = data.response.playerOverlays.playerOverlayRenderer.decoratedPlayerBarRenderer) === null || _b === void 0 ? void 0 : _b.decoratedPlayerBarRenderer.playerBar.multiMarkersPlayerBarRenderer.markersMap) === null || _c === void 0 ? void 0 : _c[0].value.chapters;
        target.chapters =
            (chapters === null || chapters === void 0 ? void 0 : chapters.map(({ chapterRenderer: c }) => ({
                title: c.title.simpleText,
                start: c.timeRangeStartMillis,
                thumbnails: new common_1.Thumbnails().load(c.thumbnail.thumbnails),
            }))) || [];
        return target;
    }
    static parseComments(data, video) {
        const endpoints = data.onResponseReceivedEndpoints.find((c) => {
            var _a;
            return (c.appendContinuationItemsAction ||
                ((_a = c.reloadContinuationItemsCommand) === null || _a === void 0 ? void 0 : _a.slot) === "RELOAD_CONTINUATION_SLOT_BODY");
        });
        const repliesContinuationItems = (endpoints.reloadContinuationItemsCommand || endpoints.appendContinuationItemsAction).continuationItems;
        const comments = data.frameworkUpdates.entityBatchUpdate.mutations
            .filter((m) => m.payload.commentEntityPayload)
            .map((m) => {
            var _a;
            const repliesItems = (_a = repliesContinuationItems.find((r) => r.commentThreadRenderer.commentViewModel.commentKey === m.key)) === null || _a === void 0 ? void 0 : _a.commentThreadRenderer;
            return Object.assign(Object.assign({}, m.payload.commentEntityPayload), repliesItems);
        });
        return comments.map((c) => new Comment_1.Comment({ video, client: video.client }).load(c));
    }
    static parseCommentContinuation(data) {
        const endpoints = data.onResponseReceivedEndpoints.at(-1);
        const continuationItems = (endpoints.reloadContinuationItemsCommand || endpoints.appendContinuationItemsAction).continuationItems;
        return common_1.getContinuationFromItems(continuationItems);
    }
}
exports.VideoParser = VideoParser;
