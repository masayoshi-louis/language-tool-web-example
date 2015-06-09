LANGUAGE = "en-US";

function hidePopup() {
	$('#popUp').hide();
	currentShownErrorNum = -1;
}

$(function() {
	hidePopup();
});

function onBtnClick() {
	hidePopup();
	var editor = $('#mainEditor');
	var text = editor.text().trim();
	var callback = function(xmlDoc) {
		var tmpList = ($(xmlDoc).find('error').map(function(i, v) {
			var category = $(v).attr('category');
			if (category == 'Possible Typo') {
				category = "Typo";
			} else {
				category = "Grammar";
			}
			var obj = {
				fromX : Number($(v).attr('fromx')),
				toX : Number($(v).attr('tox')),
				msg : $(v).attr('msg'),
				replacements : $(v).attr('replacements').split('#'),
				category : category
			};
			return obj;
		})).toArray();
		tmpList.sort(function(a, b) {
			return a.fromX - b.fromX;
		});
		// remove overlap
		var list = ($(tmpList).filter(function(i, v) {
			if (i == 0)
				return true;
			else {
				var prev = tmpList[i - 1];
				return v.fromX >= prev.toX;
			}
		})).toArray();
		if (list.length > 0) {
			var innerSpans = [];
			var procErrs = function(i, thisErr) {
				var prevOffset = i == 0 ? 0 : list[i - 1].toX;
				if (thisErr.fromX - prevOffset > 0) {
					// fill the gap
					var span = $('<span></span>');
					span.text(text.substring(prevOffset, thisErr.fromX));
					innerSpans.push(span);
				}
				var errSpan = $('<span></span>');
				var errCls = thisErr.category == 'Grammar' ? 'lt-grammar'
						: 'lt-typo';
				errSpan.addClass(errCls);
				errSpan.text(text.substring(thisErr.fromX, thisErr.toX));
				var solved = function(){
					errSpan.removeClass(errCls);
					errSpan.off('click');
					hidePopup();
				};
				var onSpanClick = function() {
					var popup = $('#popUp');
					if (currentShownErrorNum == i) {
						hidePopup();
					} else {
						popup.empty();
						currentShownErrorNum = i;
						var errMsgDiv = $('<div class="errMsg"></div>');
						errMsgDiv.text(thisErr.msg);
						popup.append(errMsgDiv);
						var procReplacement = function(rI, rV) {
							var repDiv = $('<div class="opt-replace-suggest"></div>');
							repDiv.text(rV);
							repDiv.click(function() {
								errSpan.text(rV);
								solved();
							});
							popup.append(repDiv);
						};
						$(thisErr.replacements).each(procReplacement);
						var ignoreDiv = $('<div class="opt-ignore"></div>');
						ignoreDiv.text('Ignore');
						ignoreDiv.click(function() {
							errSpan.removeClass(errCls);
							solved();
						});
						popup.append(ignoreDiv);
						popup.show();
						popup[0].style.removeProperty('top');
						popup[0].style.removeProperty('left');
						popup[0].style.removeProperty('right');
						var containerBcr = editor[0].getBoundingClientRect();
						var containerMid = (containerBcr.right - containerBcr.left)
								/ 2 + containerBcr.left;
						var spanBcr = errSpan[0].getBoundingClientRect();
						var spanMid = (spanBcr.right - spanBcr.left) / 2
								+ spanBcr.left;
						if (spanMid < containerMid)
							popup[0].style.left = spanBcr.left + 'px';
						else
							popup[0].style.left = spanBcr.right
									- popup[0].offsetWidth + 'px';
						popup[0].style.top = spanBcr.bottom + 1 + 'px';
					}
				};
				errSpan.click(onSpanClick);
				innerSpans.push(errSpan);
				if (i == list.length - 1 && thisErr.toX < text.length) {
					var span = $('<span></span>');
					span.text(text.substring(thisErr.toX, text.length));
					innerSpans.push(span);
				}
			};
			$(list).each(procErrs);
			editor.empty();
			$(innerSpans).each(function(i, v) {
				editor.append(v);
			});
		}
	};// end of callback
	$.ajax({
		type : "POST",
		url : 'lt-service',
		data : {
			language : LANGUAGE,
			text : text
		},
		success : callback,
		dataType : 'xml'
	});
};

$('#btnDoCheck').click(onBtnClick);