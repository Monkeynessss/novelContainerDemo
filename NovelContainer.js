import React, {useEffect, useState} from "react";
import Svg, {Text, TSpan} from "react-native-svg";
import {StyleSheet, View} from "react-native";
import {getTextWidth} from "./textSizeUtil";
import Swiper from 'react-native-swiper'

/**
 * 测量父容器尺寸的view
 * @param onLayout
 * @returns {JSX.Element}
 * @constructor
 */
const MeasureSizeView = ({onLayout}) => {
	return (
		<View
			onLayout={onLayout}
			style={[{alignItems: 'center', justifyContent: 'center'}, StyleSheet.absoluteFill]}>
			<View style={{width: 30, height: 30, backgroundColor: 'green'}}/>
		</View>
	)
}

/**
 * 格式化段落
 * @param str
 * @param fontSize
 * @param maxWidth
 * @returns {Promise<[]>}
 */
const formatParagraph = async (str, fontSize, maxWidth) => {
	let returnArr = [];
	let strArr = str.split(' ').filter((item) => {
		return item.trim() !== ''
	})
	let cursor = 0;
	while (cursor <= strArr.length) {
		let waitMeasureWithStr = strArr.slice(0, cursor).join(' ');
		const width = await getTextWidth(waitMeasureWithStr, fontSize, 0, waitMeasureWithStr.length)
		if (width > maxWidth) {
			returnArr.push(strArr.slice(0, cursor - 1).join(' '))
			strArr = strArr.slice(cursor - 1, strArr.length)
			cursor = 0;
		} else {
			cursor++;
		}
	}
	returnArr.push(strArr.slice(0, cursor).join(' '))
	return returnArr
}

/**
 * 格式化每页
 * @param paragraphs
 * @param fontSize
 * @param maxHeight
 * @param lineHeight
 * @param paragraphHeight
 */
const formatPage = (paragraphs, fontSize, maxHeight, lineHeight, paragraphHeight) => {

	let pages = [];
	let lines = 0;
	let cursor = 0;
	while (cursor < paragraphs.length) {
		let paragraph = paragraphs[cursor];
		lines += paragraph.text.length;
		const tspanY = getTspanY(lines, fontSize, lineHeight, paragraphHeight, cursor);
		if (tspanY >= maxHeight) {
			//这时做段落的拆分 因为这个段落
			//先回退到上一个paragraph的状态
			lines = lines - paragraph.text.length;
			let splitFlag = false;
			for (let i = 1; i < paragraph.text.length + 1; i++) {
				if (getTspanY(lines + i, fontSize, lineHeight, paragraphHeight, cursor) >= maxHeight) {
					let frontParagraph = {...paragraph, text: paragraph.text.slice(0, i - 2)}
					let behindParagraph = {...paragraph, text: paragraph.text.slice(i - 2, paragraph.text.length)}
					paragraphs.splice(cursor, 1, frontParagraph, behindParagraph)
					splitFlag = true;
					break
				}
			}
			if (splitFlag) {
				pages.push(paragraphs.slice(0, cursor + 1))
				paragraphs = paragraphs.slice(cursor + 1, paragraphs.length)
			} else {
				pages.push(paragraphs.slice(0, cursor))
				paragraphs = paragraphs.slice(cursor, paragraphs.length)
			}
			cursor = 0;
			lines = 0;
		} else {
			cursor++;
		}
	}
	pages.push(paragraphs.slice(0, cursor))
	return pages
}

//获取每行的y值
const getTspanY = (preLines, fontSize, lineHeight, paragraphHeight, tsArrIndex) => {
	return preLines * fontSize + (preLines - 1) * lineHeight + paragraphHeight * tsArrIndex
}

const NovelContainer = ({
							texts = [],
							fontSize = 14,
							lineHeight = 10,
							paragraphHeight = 10,
							fontColor = '#000000',
							backgroundColor = '#FFFFFF',
						}) => {

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const [pages, setPages] = useState([]);
	const [isLoading, setLoading] = useState(true);


	useEffect(() => {
		if (width > 0 && height > 0) {
			console.log('开始格式化')
			let startTime = Date.now();
			texts.map(async (item, index) => {
				texts[index].text = await formatParagraph(item.text, fontSize, width)
				//由于是多线程 现在检测是否还有为null的数据 没有的话表示格式化完成
				if (texts.find((item) => typeof item.text === 'string') === undefined) {
					setPages(formatPage(texts, fontSize, height, lineHeight, paragraphHeight))
					setLoading(false)
					console.log(`耗时 ： ${Date.now() - startTime}`)
				}
			})
		}
	}, [width, height])

	//load page数据，顺便测量容器大小
	if (isLoading || !width || !height) {
		return (
			<MeasureSizeView
				onLayout={(e) => {
					setWidth(e.nativeEvent.layout.width)
					setHeight(e.nativeEvent.layout.height)
				}}/>
		)
	}

	return (
		<Swiper showsPagination={false} loop={false}>

			{
				pages?.map((page, pageIndex) => {
					//记录行数
					let preLines = 0
					return (
						<Svg
							key={pageIndex}
							height={height}
							width={width}
							style={{backgroundColor}}>
							{
								page?.map((tsArr, tsArrIndex) => {
									return (
										<Text
											key={tsArrIndex}
											fill={fontColor}
											fontSize={fontSize}>
											{
												tsArr?.text?.map((ts, tsIndex) => {
													preLines++
													return (
														<TSpan
															key={tsIndex}
															y={getTspanY(preLines, fontSize, lineHeight, paragraphHeight, tsArrIndex)}
															x={0}>
															{ts}
														</TSpan>
													)
												})
											}
										</Text>
									)
								})
							}
						</Svg>
					)
				})
			}

		</Swiper>

	)

}

export default NovelContainer
