var express = require('express');
var router = express.Router();
var receipt = require('../controllers/receipt');

router.route('/getReceipt')
  .get(receipt.getReceipt)
  .post(receipt.getReceipt);

router.route('/getReceiptClip')
  .get(receipt.getReceiptClip)
  .post(receipt.getReceiptClip);

router.route('/getSales')
  .get(receipt.getSales)
  .post(receipt.getSales);

router.route('/getEventFeed')
  .get(receipt.getEventFeed)
  .post(receipt.getEventFeed);

router.route('/getEventDataById')
  .get(receipt.getEventDataById)
  .post(receipt.getEventDataById);

router.route('/getCommentList')
  .get(receipt.getCommentList)
  .post(receipt.getCommentList);

router.route('/getUserCommentList')
  .get(receipt.getUserCommentList)
  .post(receipt.getUserCommentList);

router.route('/getLastReceipt')
  .get(receipt.getLastReceipt)
  .post(receipt.getLastReceipt);

router.route('/getClientStore')
  .get(receipt.getClientStore)
  .post(receipt.getClientStore);

router.route('/addComment')
  .get(receipt.addComment)
  .post(receipt.addComment);

router.route('/universalSearch')
  .get(receipt.universalSearch)
  .post(receipt.universalSearch);

router.route('/gridUniversalSearch')
  .get(receipt.gridUniversalSearch)
  .post(receipt.gridUniversalSearch);

router.route('/importData')
  .get(receipt.importData)
  .post(receipt.importData);

router.route('/updateReceipt')
  .get(receipt.updateReceipt)
  .post(receipt.updateReceipt);

router.route('/updateData')
  .get(receipt.updateData)
  .post(receipt.updateData);

router.route('/sendVideoToUser')
  .get(receipt.sendVideoToUser)
  .post(receipt.sendVideoToUser);

router.route('/searchFilterList')
  .get(receipt.searchFilterList)
  .post(receipt.searchFilterList);

router.route('/gridSearchFilterList')
  .get(receipt.gridSearchFilterList)
  .post(receipt.gridSearchFilterList);

router.route('/receiptAction')
  .get(receipt.receiptAction)
  .post(receipt.receiptAction);

router.route('/getActivityLogs')
  .get(receipt.getActivityLogs)
  .post(receipt.getActivityLogs);

router.route('/getEventFeedTimeline')
  .get(receipt.getEventFeedTimeline)
  .post(receipt.getEventFeedTimeline);

router.route('/overlayGraphData')
  .get(receipt.overlayGraphData)
  .post(receipt.overlayGraphData);

router.route('/getFaceEvents')
  .get(receipt.getFaceEvents)
  .post(receipt.getFaceEvents);

router.route('/getCameraData')
  .get(receipt.getCameraData)
  .post(receipt.getCameraData);

router.route('/getCameraLogs')
  .get(receipt.getCameraLogs)
  .post(receipt.getCameraLogs);

router.route('/getPeopleCount')
  .get(receipt.getPeopleCount)
  .post(receipt.getPeopleCount);

router.route('/getPeopleCountLogs')
  .get(receipt.getPeopleCountLogs)
  .post(receipt.getPeopleCountLogs);

router.route('/getCameraClipData')
  .get(receipt.getCameraClipData)
  .post(receipt.getCameraClipData);

router.route('/checkVideoAvailable')
  .get(receipt.checkVideoAvailable)
  .post(receipt.checkVideoAvailable);

module.exports = router;
