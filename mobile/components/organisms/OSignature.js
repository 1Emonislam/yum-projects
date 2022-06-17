import * as React from 'react'
import { Platform, View, StyleSheet, PixelRatio } from 'react-native'
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler'
import Svg, { G, Path } from 'react-native-svg'
import { captureRef as takeSnapshotAsync } from 'react-native-view-shot'
/**
 *
 */
const isWeb = Platform.OS === 'web'
const childToWeb = child => {
  const { type, props } = child
  const name = type && type.displayName
  const webName = name && name[0].toLowerCase() + name.slice(1)
  const Tag = webName ? webName : type
  return React.createElement(
    Tag,
    Object.assign({}, props),
    toWeb(props.children)
  )
}
const toWeb = children => React.Children.map(children, childToWeb)
let ReactDOMServer
/**
 * @description Enable svg serialize to get XML output need react-dom to convert react-native-svg to web
 * @copyright https://github.com/react-native-community/react-native-svg/issues/1142
 */
export const enableXML = () => {
  try {
    ReactDOMServer = ReactDOMServer || require('react-dom/server')
  } catch (error) {
    console.warn(
      'Please first install react-dom to get output xml format, npm i react-dom'
    )
  }
}
class SignaturePanel extends React.PureComponent {
  constructor(props) {
    super(props)
    this.timer = null
    this.signatureContainerRef = React.createRef()
    this.panRef = React.createRef()
    this.tapRef = React.createRef()
    /**
     * Detect handle pan responder state to detect end touch
     */
    this.onHandlerPanStateChange = e =>
      e.nativeEvent.oldState === State.ACTIVE &&
      e.nativeEvent.state === State.END &&
      this.onTouchEnd(e)
    /**
     * Detect signature dots to draw circles
     */
    this.onHandlerTapStateChange = e =>
      e.nativeEvent.oldState === State.ACTIVE &&
      e.nativeEvent.state === State.END &&
      this.onGestureEvent(e, true)
    /**
     * Detect the touch start and move events on the signature pad
     * @param {GestureResponderEvent} e Event
     * @private
     */
    this.onGestureEvent = (e, circle) => {
      var _a, _b, _c, _d
      const { x, y } = e.nativeEvent
      const { points } = this.state
      if (this.timer) clearTimeout(this.timer)
      this.setState(
        {
          paths: this.state.paths,
          points: [...points, Object.assign({ x, y }, circle && { circle })],
        },
        () => {
          if (circle) this.onTouchEnd(e)
        }
      )
      if (circle)
        (_b = (_a = this.props).onTap) === null || _b === void 0
          ? void 0
          : _b.call(_a, e)
      else
        (_d = (_c = this.props).onTouch) === null || _d === void 0
          ? void 0
          : _d.call(_c, e)
    }
    /**
     * Takes the points and forms an SVG from them
     * @param {Array} paths
     * @param {Array} points
     * @return {Element}*
     * @private
     */
    this.renderSvg = (paths, points) => {
      const { width, height, strokeColor, strokeWidth } = this.props
      return React.createElement(
        Svg,
        { style: styles.pad, width: width, height: height },
        React.createElement(
          G,
          null,
          paths.map((path, i) =>
            React.createElement(React.Fragment, { key: `path-${i}` }, path)
          ),
          React.createElement(Path, {
            d: this.plotToSvg(points),
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            fill: 'none',
          })
        )
      )
    }
    /**
     * Sets the layout view
     * @param {LayoutChangeEvent} e Event
     * @private
     */
    this.onLayoutContainer = e => {
      const { x, y } = e.nativeEvent.layout
      const { offsetX, offsetY } = this.props
      this.setState({
        posX: x + offsetX,
        posY: y + offsetY,
      })
    }
    /**
     * @description autoSave function when touchEnd
     */
    this.autoSave = async () => {
      var _a, _b, _c, _d
      try {
        const file = await this.save()
        ;(_b = (_a = this.props).onFingerUp) === null || _b === void 0
          ? void 0
          : _b.call(_a, file)
      } catch (error) {
        // eslint-disable-next-line
        ;(_d = (_c = this.props).onAutoSaveError) === null || _d === void 0
          ? void 0
          : _d.call(_c, error)
      } finally {
        this.timer = null
      }
    }
    /**
     * @description returnSignature check if autoSave if enable
     */
    this.returnSignature = () => {
      const { onFingerUp, outputType, autoSave } = this.props
      if (autoSave && outputType !== 'xml' && outputType !== 'paths') {
        this.timer = setTimeout(this.autoSave.bind(this), 1000)
      } else {
        return onFingerUp === null || onFingerUp === void 0
          ? void 0
          : onFingerUp(outputType === 'xml' ? this.xml : this.paths)
      }
    }
    this.state = {
      paths: [],
      points: [],
      posX: 0,
      posY: 0,
    }
  }
  /**
   * @description get SVG paths
   */
  get paths() {
    return React.Children.map(this.state.paths, child => child.props.d)
  }
  /**
   * @description get xml tags of signature from SVG paths
   */
  get xml() {
    return SignaturePanel.serializeSvg(this._signatureElement)
  }
  /**
   * Resets the signature pad container
   * @param {GestureResponderEvent} e Event
   * @public
   */
  reset() {
    this.setState({
      paths: [],
      points: [],
      posX: 0,
      posY: 0,
    })
  }
  /**
   * @description save signature
   */
  async save(options) {
    const {
      imageFormat,
      outputType,
      imageOutputSize,
      imageQuality,
    } = this.props
    const size = imageOutputSize / PixelRatio.get()
    return await takeSnapshotAsync(
      this.signatureContainerRef,
      Object.assign(
        {
          format: imageFormat,
          height: size,
          width: size,
          quality: imageQuality,
          result: outputType,
        },
        options
      )
    )
  }
  componentDidMount() {
    // automatic enable XML if outputType if xml
    if (this.props.outputType === 'xml' && !ReactDOMServer) enableXML()
  }
  componentWillUnmount() {
    // clear timer on unmount signature panel
    this.timer && clearTimeout(this.timer)
    this._signatureElement = undefined
  }
  render() {
    const {
      containerStyle,
      width,
      height,
      shouldCancelWhenOutside,
    } = this.props
    const { paths, points } = this.state
    this._signatureElement = this.renderSvg(paths, points)
    return React.createElement(
      PanGestureHandler,
      {
        ref: this.panRef,
        maxPointers: 1,
        minPointers: 1,
        shouldCancelWhenOutside: shouldCancelWhenOutside,
        onHandlerStateChange: this.onHandlerPanStateChange,
        onGestureEvent: this.onGestureEvent,
      },
      React.createElement(
        TapGestureHandler,
        {
          ref: this.tapRef,
          numberOfTaps: 1,
          onHandlerStateChange: this.onHandlerTapStateChange,
          waitFor: this.panRef,
        },
        React.createElement(
          View,
          {
            ref: this.signatureContainerRef,
            onLayout: this.onLayoutContainer,
            style: [containerStyle, { width, height }],
          },
          this._signatureElement
        )
      )
    )
  }
  /**
   * Detect when the user has finished the gesture
   * @private
   */
  onTouchEnd(e) {
    var _a, _b
    const { paths, points } = this.state
    const { strokeColor, strokeWidth } = this.props
    const newPath = React.createElement(Path, {
      d: this.plotToSvg(points),
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fill: 'none',
    })
    this.setState(
      {
        paths: [...paths, newPath],
        points: [],
      },
      this.returnSignature
    )
    ;(_b = (_a = this.props).onTouchEnd) === null || _b === void 0
      ? void 0
      : _b.call(_a, e)
  }
  /**
   * Plots the captured points to an array
   * @param {Array} points Points
   * @return {any}
   * @private
   */
  plotToSvg(points) {
    var _a
    const { posX, posY } = this.state
    const R = this.props.circleRadius
    if (points.length > 0) {
      let path = !((_a = points[0]) === null || _a === void 0
        ? void 0
        : _a.circle)
        ? `M ${points[0].x - posX},${points[0].y - posY}`
        : ''
      points.forEach(point => {
        path += point.circle
          ? `M ${point.x - R},${point.y} a ${R},${R} 0 1,0 ${
              R * 2
            },0 a ${1},${1} 0 1,0 -${R * 2},0` // <-- to allow dots when user tap screen
          : ` L ${point.x - posX},${point.y - posY}`
      })
      return path
    } else {
      return ''
    }
  }
}
SignaturePanel.defaultProps = {
  height: 250,
  imageFormat: undefined,
  imageOutputSize: 480,
  imageQuality: 1.0,
  offsetX: 0,
  offsetY: 0,
  outputType: 'paths',
  strokeColor: '#000',
  strokeWidth: 2.5,
  width: '100%',
  autoSave: true,
  circleRadius: 1.0,
}
/**
 * @description return signature in string HTML format you can save in file
 * call enableXML before call this function
 */
SignaturePanel.serializeSvg = signatureElement =>
  signatureElement &&
  (ReactDOMServer === null || ReactDOMServer === void 0
    ? void 0
    : ReactDOMServer.renderToStaticMarkup(
        isWeb ? signatureElement : toWeb(signatureElement)
      ))
const styles = StyleSheet.create({
  pad: {
    backgroundColor: 'transparent',
  },
})
export default SignaturePanel
