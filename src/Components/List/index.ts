import { BaseEventModel } from '../../Framework/Model'
import { getBase, getHotelListSearchParams, localeEnum, sourceFromEnum } from '@ctrip/SevenHills'
import {
    backSearchErrorCode,
    emitterTypeEnum,
    emptyEnum,
    footerEnum,
    HIDE_TRAVEL_STANDARDS,
    LIST_SEARCH_REQUEST_KEY,
    LOG_DEV_TRACE_KEYS,
    LOG_TRACE_KEYIDS,
    loginErrorCode,
    moduleTypeEnum,
    onlineLocale,
    PARAMS_INIT_KEY,
    PARAMS_ONLINE_EXTRA,
    reloadSearchErrorCode,
    SHARK_CONFIGS,
    statusEnum,
    STORAGE_DOMAIN_HOTEL,
    STORAGE_KEY_HOTEL_COMMON,
    STORAGE_KEY_HOTEL_LIST_BACK_DATA,
    STORAGE_KEY_HOTEL_LIST_OUTPUT_INFO_FIRST_TIME,
    STORAGE_KEY_HOTEL_LIST_SEARCH,
    STORAGE_LOCAL_STORAGE,
    STORAGE_SESSION_STORAGE,
    TRACE_SEARCH_KEY,
    TRACE_SEARCH_ONLINE_KEY,
    TRACE_TRAVEL_POLICY_INFO_KEY_STR,
    STORAGE_KEY_HOTEL_LIST_CRN_SEARCH,
} from '../../Constants'
import { diffTime, formatDate, IBUL10nDateFormatterLite, joinPath } from '@ctrip/corp-pure-functions'
import { EmitterAction, listEmitter } from '../../EventBus'
import {
    CompatibleMap,
    Coordinate,
    FilterItem,
    HotelListItemType,
    ISearchHotelRequest,
    ISearchHotelResponse,
    ISearchOutputRequest,
    ISearchOutputResponse,
    OtherFilter,
    PriceAndStarFilter,
    SearchItem,
    TravelPolicyInfoType,
} from '../../Api/List/interface'
import {
    HOTEL_LIST_CHANGE_MAP_CITY_EVENT,
    HOTEL_LIST_CHANGE_MAP_EVENT,
    HOTEL_LIST_CHANGE_NOTICE_EVENT,
    HOTEL_LIST_GET_FILTER_LIST_EVENT,
    HOTEL_LIST_INIT_VIRTUAL_EVENT,
    HOTEL_LIST_SEARCH_BY_CUSTOM_DESTINATION_EVENT,
    HOTEL_LIST_SEARCH_BY_MAP_EVENT,
    HOTEL_LIST_SEARCH_BY_SEARCH_EVENT,
    HOTEL_LIST_UPDATE_HAS_FILTER_EVENT,
    HOTEL_LIST_UPDATE_MAP_DATA_EVENT,
    HOTEL_LIST_UPDATE_ONLINE_MAP_COMPATIBLE_MAP_EVENT,
    HOTEL_LIST_UPDATE_ONLINE_MAP_HOTELS_EVENT,
    HOTEL_LIST_UPDATE_SEARCH_STORAGE_EVENT,
    HOTEL_LIST_WEB_VIEW_ON_RESUME,
} from '../../EventBus/Events'
import { getList, getOutputInfo } from '../../Api/List/sendRequest'
import {
    ICoordinateMap,
    ICoordinateMapItem,
    ICustomConditionRequestParams,
    IGetFilterListResponse,
    IHotelListToh5Detail,
    IHotelListToOnlineDetail,
    IListModelProps,
    ILoadMoreHotelList,
    IMapSearchCallbackArg,
    ISearchByMap,
    ISetFooterStatus,
    ISetHasFilter,
    ISetHotelList,
    ISetIsMapMode,
    ISetOutputInfo,
    ISetPageStatus,
} from './interface'
import { h5Detail, onlineDetail, removeFromCRNSearchStorage, saveMultiSearchStorage } from './linkDetail'
import { getCtripToken } from '../../Api/BindAccount/sendRequest'
import {
    IGetCtripTokenRequest,
    IGetCtripTokenResponse,
    ISsoCrossSetCookieRequest,
    ISsoCrossSetCookieResponse,
} from '../../Api/BindAccount/interface'
import { SetCookie } from '@ctrip/H5GenericFunctions'
import { requestSecret } from '../../Api/BindAccount/requireSecret'
import { handleHotelList } from '../../Common/utils'
import { GeoInfo } from '../Map/interface'

declare const H5EventPlugin

class ListModel extends BaseEventModel {
    private setHotelListCallBack?: (i: ISetHotelList) => void
    private setPageStatusCallBack?: (i: ISetPageStatus) => void
    private setFooterStatusCallBack?: (i: ISetFooterStatus) => void
    private setIsMapModeCallback?: (i: ISetIsMapMode) => void
    private setHasFilterCallback?: (i: ISetHasFilter) => void
    private setOutputInfoCallback?: (i: ISetOutputInfo) => void

    /**
     * common
     */
    public pageStatus: statusEnum = statusEnum.LOADING
    public footerStatus: footerEnum = footerEnum.SUCCESS
    public emptyStatus: emptyEnum = emptyEnum.NOT_EMPTY
    public timstamp: number = new Date().getTime() // bi埋点用
    public requestid: string | null = null // bi埋点用

    /**
     * 标识
     */
    // 模块名称
    private moduleType: moduleTypeEnum | null
    // 四个模块的经纬度数据
    private coordinateMap: ICoordinateMap = {
        DESTINATION: {
            coordinate: null,
            timeStamp: null,
        },
        KEYWORD: {
            coordinate: null,
            timeStamp: null,
        },
        FILTER: {
            coordinate: null,
            timeStamp: null,
        },
        MAP: {
            coordinate: null,
            timeStamp: null,
        },
    }
    /**
     * 是否CRN查询页过来
     */
    public isCRN = false

    /**
     * 定制需求
     */
    // 展示差标
    private showTravelStandards = false
    // 隐藏搜索框
    private hideHeadSearch = false
    // 展示拜耳logo
    private showBayerLogo = false

    /**
     * 请求参数
     */
    private pageSize = 15
    // fix 复工复产未撑满6条时自动加载数据
    private autoLoadSize = 6
    private autoLoadTotalPageNum = 3
    private autoLoadPageNum = 1
    public pageNo = 1
    private isFirstPage = true
    private isLastPage = false
    // 关键字type(模糊搜索接口下发)
    private keywordsType: number | null
    // 关键字source(关键字初始化接口下发)
    private keywordsSource: string | null
    // 入住日期
    public checkIn: string | null
    // 离店日期
    public checkOut: string | null
    // 间数
    private roomQuantity: number
    // 成人数
    private adultQuantity: number
    // 搜索关键字 来源：在searchList为空但是用户进行了输入时的模糊匹配
    private keyword: string | null = ''
    // 政策执行人
    private policyId: string | null = ''
    // 对应geoCategoryId的行政区域ID
    public geoId: number | 0
    // 对应geoCategoryId的行政区域Name
    public geoCategoryName: string
    // 行政区域类型（国家:1、省份:2、城市:3、行政区:4、景区:5、商圈:6）
    public geoCategoryId: number | 0
    // Coordinate 经纬度
    private coordinate: Coordinate | null
    // 地图模式查询范围：地图页请求时发送
    private screenDistance: string | null
    // 位置
    private positionSelectedItem: SearchItem[] | null
    // 排序
    private sortFilter: FilterItem[] | null
    // 快筛项列表
    private quickFilter: FilterItem[] | null
    // 快筛
    private otherFilter: OtherFilter | null
    // 价格星级筛选列表 价格的data字段有最低值和最高值
    private priceAndStarFilter: PriceAndStarFilter | null
    // 搜索项列表 目前只支持一个值 基于SOA服务多搜功能的拓展 来源：联想界面选中某项目后把该项目的key和id放在请求中直接发送
    private selectedSearchItem: SearchItem | null
    private travelPolicyInfo: TravelPolicyInfoType | null
    // 提前审批前置选中审批单中带入的hotelId
    private hotelId: string[] | null
    // 提前审批前置审批单号，提前审批前置必传
    private approvalNo: string | null
    // 行程模式：行程id
    private tripID: string | null
    // 【仅Online】入住人信息（为他人预订）（兼容详情页跳转）
    private clients: string | null
    // 【仅Online】入住人信息（按入住人差标管控选择的入住人）（兼容详情页跳转）
    private guests: string | null
    // 【仅Online】查询页关键词信息json
    private keywordInfoJson: string | null
    // 筛选项
    private filterList: IGetFilterListResponse | null = null
    private oaAuthMode = false

    /**
     * 响应参数
     */
    public hotelList: HotelListItemType[] = []
    public centerPos: Coordinate | null
    public customizeMap: { [key: string]: string } | null
    public compatibleMap: CompatibleMap | null
    public responseCode = 0
    public responseDesc = ''

    /**
     * 因公因私
     */
    public isPublic: boolean
    /**
     * 语言
     */
    public language: localeEnum
    /**
     * 是否地图模式
     */
    public isMapMode = false
    /**
     * 国内海外，false:国内 true:海外
     */
    public isInt: boolean
    /**
     * 是否有筛选项
     */
    public hasFilter = false
    /**
     * 	是否虚卡模式
     */
    public isVirtualModle = false
    /**
     * 是否需要绑定散客账户
     */
    public needBindTrip = false
    /**
     * 是否展示随心订
     */
    public isShowSXD = false
    /**
     * 会员绑定弹框
     */
    public vipBindModelVisible = false
    /**
     * 随心订弹框
     */
    public orderLikeModelVisible = false
    /**
     * 跳转登录页弹框
     */
    public loginModalVisible = false
    /**
     * 日期过期弹框
     */
    public reloadSearchModalVisible = false
    /**
     * 返回查询页弹框
     */
    public backSearchModalVisible = false

    // shark start
    public errorTipShark = this.getSharkText(SHARK_CONFIGS.loadErrorTryAgain)
    public tryAgainTipShark = this.getSharkText(SHARK_CONFIGS.tryAgain)
    public beginStrShark = this.getSharkText(SHARK_CONFIGS.beginStr)
    public someCommentShark = (num: number): string => {
        return this.getSharkText(SHARK_CONFIGS.someComment, [num])
    }
    public noCommentShark = this.getSharkText(SHARK_CONFIGS.noComment)
    public hasTaxesShark = this.getSharkText(SHARK_CONFIGS.hasTaxes)
    public soldOutShark = this.getSharkText(SHARK_CONFIGS.soldOut)
    public isLoadingShark = this.getSharkText(SHARK_CONFIGS.isLoading)
    public noMoreShark = this.getSharkText(SHARK_CONFIGS.noMore)
    public selectShark = this.getSharkText(SHARK_CONFIGS.select)
    public onlineIsLoadingShark = this.getSharkText(SHARK_CONFIGS.onlineIsLoading)
    public filterEmptyTipShark = this.getSharkText(SHARK_CONFIGS.filterEmptyTip)
    public checkFilterTipShark = this.getSharkText(SHARK_CONFIGS.checkFilterTip)
    public morepayShark = this.getSharkText(SHARK_CONFIGS.morepay)
    public morepaysecondShark = this.getSharkText(SHARK_CONFIGS.morepaysecond)
    public morepaydetailiconShark = this.getSharkText(SHARK_CONFIGS.morepaydetailicon)
    public changeFilterToGetMoreDataShark = this.getSharkText(SHARK_CONFIGS.changeFilterToGetMoreData)
    public virtualModleShark = this.getSharkText(SHARK_CONFIGS.virtualModle)
    public H5filterEmptyShark = this.filterEmptyTipShark + ',' + this.checkFilterTipShark
    public noSearchDataShark = (): string => {
        const checkInStr = new IBUL10nDateFormatterLite(this.getSharkLocale(), this.checkIn || '').mdShortString()
        const checkOutStr = new IBUL10nDateFormatterLite(this.getSharkLocale(), this.checkOut || '').mdShortString()
        return this.getSharkText(SHARK_CONFIGS.noSearchData, [
            this.geoCategoryName || '',
            checkInStr || '',
            checkOutStr || '',
        ])
    }
    private todayShark = this.getSharkText(SHARK_CONFIGS.today)
    private tomorrowShark = this.getSharkText(SHARK_CONFIGS.tomorrow)
    private acquiredShark = this.getSharkText(SHARK_CONFIGS.acquired)
    public bindNowShark = this.getSharkText(SHARK_CONFIGS.bindNow)
    public knowShark = this.getSharkText(SHARK_CONFIGS.know)
    public enjoyHighQualityHotelShark = this.getSharkText(SHARK_CONFIGS.enjoyHighQualityHotel)
    public payTipShark = this.getSharkText(SHARK_CONFIGS.payTip)
    public loadErrorClickTryAgainShark = this.getSharkText(SHARK_CONFIGS.loadErrorClickTryAgain)
    public loginValidShark = this.getSharkText(SHARK_CONFIGS.loginValid)
    public loginAgainShark = this.getSharkText(SHARK_CONFIGS.loginAgain)
    public insufficientPermissionsShark = this.getSharkText(SHARK_CONFIGS.insufficientPermissions)
    public verificationAndJumpFailedShark = this.getSharkText(SHARK_CONFIGS.verificationAndJumpFailed)
    public determineShark = this.getSharkText(SHARK_CONFIGS.determine)
    public loadingStopShark = this.getSharkText(SHARK_CONFIGS.loadingStop)
    // shark end
    public constructor(props?: IListModelProps) {
        super()
        const {
            setHotelListCallBack,
            setPageStatusCallBack,
            setFooterStatusCallBack,
            setIsMapModeCallback,
            setHasFilterCallback,
            setOutputInfoCallback,
        } = props || {}
        this.setHotelListCallBack = setHotelListCallBack || this.setHotelListCallBack
        this.setPageStatusCallBack = setPageStatusCallBack || this.setPageStatusCallBack
        this.setFooterStatusCallBack = setFooterStatusCallBack || this.setFooterStatusCallBack
        this.setIsMapModeCallback = setIsMapModeCallback || this.setIsMapModeCallback
        this.setHasFilterCallback = setHasFilterCallback || this.setHasFilterCallback
        this.setOutputInfoCallback = setOutputInfoCallback || this.setOutputInfoCallback
        this.initPage().finally(async () => {
            this.addEmitters()
            this.addEventListeners()
            this.EmitterNotice()
            await this.getSearchOutputInfo()
            await this.traceSearchParams()
            await this.syncLSSStorage()
        })
    }

    protected registerEmitters(type: emitterTypeEnum.add | emitterTypeEnum.remove): void {
        EmitterAction({
            type,
            event: HOTEL_LIST_SEARCH_BY_CUSTOM_DESTINATION_EVENT,
            action: this.searchHotelListByCustomDestinationAction,
        })
        EmitterAction({ type, event: HOTEL_LIST_SEARCH_BY_MAP_EVENT, action: this.searchHotelListByMapAction })
        EmitterAction({ type, event: HOTEL_LIST_CHANGE_MAP_EVENT, action: this.changeMapModeAction })
        EmitterAction({ type, event: HOTEL_LIST_UPDATE_HAS_FILTER_EVENT, action: this.updateHasFilterAction })
        EmitterAction({ type, event: HOTEL_LIST_UPDATE_SEARCH_STORAGE_EVENT, action: this.updateSearchStorageAction })
        EmitterAction({ type, event: HOTEL_LIST_GET_FILTER_LIST_EVENT, action: this.setFilterListAction })
        EmitterAction({ type, event: HOTEL_LIST_WEB_VIEW_ON_RESUME, action: this.onResumeAction })
        EmitterAction({
            type,
            event: HOTEL_LIST_CHANGE_MAP_CITY_EVENT,
            action: this.updateCoordinateMapByChangeCityAction,
        })
    }

    protected registerEventListeners(): void {
        // online专用
        window.addEventListener(HOTEL_LIST_SEARCH_BY_SEARCH_EVENT, (args: never) => {
            const { detail } = args || { detail: null }
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            detail.isDisableSearchHotelList = true
            this.searchHotelListByCustomDestinationAction(detail)
        })
    }

    protected removesEventListeners(): void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        window.removeEventListener(HOTEL_LIST_SEARCH_BY_SEARCH_EVENT, () => {})
    }

    /**
     * 初始化获取查询接口参数
     * 注意：不要在这里面调接口、不要在这里面调接口、不要在这里面调接口
     */
    private initPage = async () => {
        try {
            this.initAllParams()
            const { Log, getUrlQuery, Storage } = getBase()
            this.isCRN =
                getUrlQuery({ name: 'isCRN' }) ||
                (await Storage.load({
                    key: STORAGE_KEY_HOTEL_LIST_CRN_SEARCH,
                    domain: STORAGE_DOMAIN_HOTEL,
                    type: STORAGE_SESSION_STORAGE,
                }))
            const { isIntl = false, isPublic = false, Language = localeEnum.zhCN } = this.getEnvironment()
            this.isInt = isIntl
            this.isPublic = isPublic
            this.language = Language
            const initParams = {
                isInt: isIntl,
                ...(await getHotelListSearchParams()),
            }
            const traceObj = {}
            TRACE_SEARCH_KEY.forEach(key => {
                traceObj[key] = initParams[key]
            })
            traceObj['isInt'] = isIntl
            traceObj['isPublic'] = isPublic
            traceObj['Language'] = Language
            Log.devTrace(
                LOG_DEV_TRACE_KEYS.HOTEL_LIST_TRAVEL_POLICY_INFO_INIT_PAGE_PARAMS,
                initParams[TRACE_TRAVEL_POLICY_INFO_KEY_STR] || {},
            )
            if (this.isOnline()) {
                const extraTraceObj = {}
                TRACE_SEARCH_ONLINE_KEY.forEach(key => {
                    extraTraceObj[key] = initParams[key]
                })
                Log.devTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_ONLINE_EXTRA_INIT_PAGE_PARAMS, extraTraceObj)
            }
            Log.devTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_INIT_PAGE_PARAMS, traceObj)
            PARAMS_INIT_KEY.forEach(key => {
                if (key === 'coordinateMap') {
                    if (initParams['coordinateMap']) {
                        this[key] = initParams[key]
                    }
                } else {
                    this[key] = initParams[key]
                    if (key === 'mapMode') {
                        this.isMapMode = initParams[key]!
                        this.changeMapModeAction(this.isMapMode)
                    }
                }
            })
            // 初始化经纬度
            this.getCoordinateRequestParam(this.coordinate)
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 重读缓存配置
     */
    private onResumeInitPage = () => {
        const { setHotelListCallBack, loginModalVisible, reloadSearchModalVisible, backSearchModalVisible } = this
        // fix 预加载未关闭的弹框
        if (loginModalVisible || reloadSearchModalVisible || backSearchModalVisible) {
            this.loginModalVisible = false
            this.reloadSearchModalVisible = false
            this.backSearchModalVisible = false
        }
        this.pageStatus = statusEnum.LOADING
        setHotelListCallBack && this.setHotelList(setHotelListCallBack)
        this.initPage().finally(async () => {
            await this.getSearchOutputInfo()
            await this.traceSearchParams()
            await this.syncLSSStorage()
        })
    }

    /**
     * 初始化参数
     * fix预加载记录上一次参数
     */
    private initAllParams = () => {
        const { isIntl = false, isPublic = false, Language = localeEnum.zhCN } = this.getEnvironment()
        this.isInt = isIntl
        this.isPublic = isPublic
        this.language = Language
        this.pageStatus = statusEnum.LOADING
        this.footerStatus = footerEnum.SUCCESS
        this.emptyStatus = emptyEnum.NOT_EMPTY
        this.moduleType = null
        this.coordinate = null
        this.coordinateMap = {
            DESTINATION: {
                coordinate: null,
                timeStamp: null,
            },
            KEYWORD: {
                coordinate: null,
                timeStamp: null,
            },
            FILTER: {
                coordinate: null,
                timeStamp: null,
            },
            MAP: {
                coordinate: null,
                timeStamp: null,
            },
        }
        this.showTravelStandards = false
        this.hideHeadSearch = false
        this.showBayerLogo = false
        this.autoLoadPageNum = 1
        this.pageNo = 1
        this.keywordsType = null
        this.keywordsSource = null
        this.checkIn = null
        this.checkOut = null
        this.roomQuantity = 1
        this.adultQuantity = 1
        this.keyword = ''
        this.policyId = ''
        this.geoId = 0
        this.geoCategoryId = 3
        this.screenDistance = null
        this.positionSelectedItem = null
        this.sortFilter = null
        this.quickFilter = null
        this.otherFilter = null
        this.priceAndStarFilter = null
        this.selectedSearchItem = null
        this.travelPolicyInfo = null
        this.hotelId = null
        this.approvalNo = null
        this.tripID = null
        this.clients = null
        this.guests = null
        this.keywordInfoJson = null
        this.filterList = null
        this.oaAuthMode = false
        this.hotelList = []
        this.centerPos = null
        this.customizeMap = null
        this.compatibleMap = null
        this.responseCode = 0
        this.responseDesc = ''
        this.isMapMode = false
        this.hasFilter = false
        this.isVirtualModle = false
        this.needBindTrip = false
        this.isShowSXD = false
        this.vipBindModelVisible = false
        this.orderLikeModelVisible = false
        this.loginModalVisible = false
        this.reloadSearchModalVisible = false
        this.backSearchModalVisible = false
        this.isCRN = false
    }

    /**
     * storage数据埋点
     */
    private traceSearchParams = async () => {
        const { CacheStorage, PluginStorage, Storage, Log } = getBase()
        let hotelListSearchLeoma = {}
        let hotelListSearch = {}
        if (this.isCRN) {
            hotelListSearch =
                PluginStorage.load({
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                    domain: STORAGE_DOMAIN_HOTEL,
                    type: STORAGE_SESSION_STORAGE,
                }) || {}
        } else {
            hotelListSearchLeoma =
                CacheStorage.load({
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                    domain: STORAGE_DOMAIN_HOTEL,
                    type: STORAGE_SESSION_STORAGE,
                }) || {}
            hotelListSearch =
                (await Storage.load({
                    type: STORAGE_LOCAL_STORAGE,
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                })) || {}
            if (typeof hotelListSearchLeoma === 'string') {
                hotelListSearchLeoma = JSON.parse(hotelListSearchLeoma)
            }
            Log.devTrace(
                LOG_DEV_TRACE_KEYS.HOTEL_LIST_TRAVEL_POLICY_INFO_SEARCH_LEOMA,
                hotelListSearchLeoma[TRACE_TRAVEL_POLICY_INFO_KEY_STR] || {},
            )
            if (this.isOnline()) {
                const extraTraceObj = {}
                TRACE_SEARCH_ONLINE_KEY.forEach(key => {
                    extraTraceObj[key] = hotelListSearchLeoma[key]
                })
                Log.devTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_ONLINE_EXTRA_SEARCH_LEOMA, extraTraceObj)
            }
            const traceLeomaObj = {}
            TRACE_SEARCH_KEY.forEach(key => {
                traceLeomaObj[key] = hotelListSearchLeoma[key]
            })
            Log.devTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_SEARCH_LEOMA, traceLeomaObj)
        }
        if (typeof hotelListSearch === 'string') {
            hotelListSearch = JSON.parse(hotelListSearch)
        }
        Log.devTrace(
            LOG_DEV_TRACE_KEYS.HOTEL_LIST_TRAVEL_POLICY_INFO_SEARCH_STORAGE,
            hotelListSearch[TRACE_TRAVEL_POLICY_INFO_KEY_STR] || {},
        )
        if (this.isOnline()) {
            const extraTraceObj = {}
            TRACE_SEARCH_ONLINE_KEY.forEach(key => {
                extraTraceObj[key] = hotelListSearch[key]
            })
            Log.devTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_ONLINE_EXTRA_SEARCH_STORAGE, extraTraceObj)
        }
        const traceObj = {}
        TRACE_SEARCH_KEY.forEach(key => {
            traceObj[key] = hotelListSearch[key]
        })
        Log.devTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_SEARCH_STORAGE, traceObj)
    }

    /**
     * 随心订、会员绑定是否弹窗处理
     */
    private getSearchOutputInfo = async () => {
        await this.searchOutputInfo()
        const backFromHotelDetail = getBase().getUrlQuery({ name: 'goBack' })
        const outputInfoFirstTime = await this.getOutputInfoFirstTime()
        if (!backFromHotelDetail) {
            if (this.isShowSXD && (!outputInfoFirstTime || (outputInfoFirstTime && !outputInfoFirstTime[0]))) {
                this.orderLikeModelVisible = true
                if (outputInfoFirstTime) {
                    outputInfoFirstTime[0] = true
                }
            }
            if (
                !this.orderLikeModelVisible &&
                this.needBindTrip &&
                (!outputInfoFirstTime || (outputInfoFirstTime && !outputInfoFirstTime[1]))
            ) {
                this.vipBindModelVisible = true
                if (outputInfoFirstTime) {
                    outputInfoFirstTime[1] = true
                }
            }
        }
        this.setOutputInfoCallback && this.setOutputInfo(this.setOutputInfoCallback)
        if (!backFromHotelDetail) {
            await this.setOutputInfoFirstTime(outputInfoFirstTime)
        }
    }

    /**
     * 同步ls、ss storage, fix online/h5 new Tab getData error
     */
    private syncLSSStorage = async () => {
        const { Storage } = getBase()
        if (!this.isCRN) {
            const commonSessionParams = await Storage.load(
                {
                    type: 'ss',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_COMMON,
                },
                false,
            )
            const commonLocalParams = await Storage.load(
                {
                    type: 'ls',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_COMMON,
                },
                false,
            )
            const searchSessionParams = await Storage.load(
                {
                    type: 'ss',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                },
                false,
            )
            const searchLocalParams = await Storage.load(
                {
                    type: 'ls',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                },
                false,
            )
            if (!commonSessionParams && commonLocalParams) {
                Storage.save({
                    type: 'ss',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_COMMON,
                    value: commonLocalParams,
                })
            }
            if (!commonLocalParams && commonSessionParams) {
                Storage.save({
                    type: 'ls',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_COMMON,
                    value: commonSessionParams,
                })
            }
            if (!searchSessionParams && searchLocalParams) {
                Storage.save({
                    type: 'ss',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                    value: searchLocalParams,
                })
            }
            if (!searchLocalParams && searchSessionParams) {
                Storage.save({
                    type: 'ls',
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_LIST_SEARCH,
                    value: searchSessionParams,
                })
            }
        }
    }

    /**
     * 后台切换到前台
     */
    private onResumeAction = () => {
        this.onResumeInitPage()
    }

    /**
     * 处理接口需要的参数
     */
    private handleRequestParams = () => {
        const requestParams = {}
        LIST_SEARCH_REQUEST_KEY.forEach(key => {
            // fix 未成功跳转其他页，清除了coordinate，导致丢失经纬度
            if (key === 'coordinate') {
                const newCoordinate = this.getCoordinateRequestParam(undefined, true)?.coordinate || null
                if (newCoordinate) {
                    requestParams['coordinate'] = newCoordinate
                }
            } else if (this[key] !== undefined && this[key] !== null) {
                requestParams[key] = this[key]
            }
        })
        if (!this.isOnline()) {
            PARAMS_ONLINE_EXTRA.forEach(key => {
                delete requestParams[key]
            })
        }
        // 兜底异常值
        requestParams['geoCategoryId'] = this.geoCategoryId || 3
        requestParams['roomQuantity'] = this.roomQuantity || 1
        requestParams['adultQuantity'] = this.adultQuantity || 1
        return requestParams
    }

    /**
     * 查询：第一页查询酒店列表
     */
    public searchHotelList = async () => {
        if (this.pageStatus === statusEnum.ERROR) {
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_PAGE_STATUS_IS_ERROR)
        }
        const { setHotelListCallBack, setPageStatusCallBack } = this
        this.timstamp = new Date().getTime()
        this.pageStatus = statusEnum.LOADING
        setPageStatusCallBack && this.setPageStatus(setPageStatusCallBack)
        const requestParams = this.handleRequestParams()
        this.pageNo = 1
        requestParams['pageNo'] = this.pageNo
        this.logDevTrace(
            LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_HOTEL_LIST_REQ_TRAVEL_POLICY_INFO_PARAMS,
            requestParams[TRACE_TRAVEL_POLICY_INFO_KEY_STR],
        )
        if (this.isOnline()) {
            const extraTraceObj = {}
            TRACE_SEARCH_ONLINE_KEY.forEach(key => {
                extraTraceObj[key] = requestParams[key]
            })
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_HOTEL_LIST_REQ_ONLINE_EXTRA_PARAMS, extraTraceObj)
        }
        const traceObj = {
            pageNo: requestParams['pageNo'],
        }
        TRACE_SEARCH_KEY.forEach(key => {
            traceObj[key] = requestParams[key]
        })
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_HOTEL_LIST_REQ_SEARCH_PARAMS, traceObj)
        try {
            const response: ISearchHotelResponse = await getList(requestParams as ISearchHotelRequest)
            this.geoId = requestParams['geoId']
            this.requestid = response?.traceId || null
            this.responseCode = response?.responseCode
            this.responseDesc = response?.responseDesc!
            this.autoLoadPageNum = 1
            if (response?.responseCode === 20000) {
                this.logTrace(LOG_TRACE_KEYIDS.HOTEL_LIST_FETCH_HOTEL_LIST_SUCCESS, {
                    requestid: this.requestid,
                    timestamp: this.timstamp,
                    cityid: this.geoId,
                    cost: new Date().getTime() - this.timstamp,
                })
                // 接口数据处理start
                this.hotelList = handleHotelList({
                    hotelList: JSON.parse(JSON.stringify(response?.hotelList || [])),
                    customizeMap: response?.customizeMap,
                    isInt: this.isInt,
                    Language: this.language,
                    sourceFrom: getBase().sourceFrom,
                })
                // 接口数据处理end

                // 列表数据赋值start
                this.pageNo = 1
                this.isLastPage = !!response.isLastPage
                this.pageStatus = statusEnum.SUCCESS
                this.footerStatus = this.isLastPage ? footerEnum.NO_MORE : footerEnum.SUCCESS
                this.centerPos = response?.centerPos || null
                this.compatibleMap = response?.compatibleMap || null
                this.customizeMap = response?.customizeMap || null
                const hasHotelList = this.hotelList?.length > 0
                if (hasHotelList) {
                    this.emptyStatus = emptyEnum.NOT_EMPTY
                } else if (!hasHotelList) {
                    this.emptyStatus = this.hasFilter ? emptyEnum.FILTER_EMPTY : emptyEnum.SEARCH_EMPTY
                }
                setHotelListCallBack && this.setHotelList(setHotelListCallBack)
                // 列表数据赋值end

                // online平台start
                if (this.isOnline()) {
                    listEmitter.emit(HOTEL_LIST_UPDATE_ONLINE_MAP_HOTELS_EVENT, {
                        hotelList: this.hotelList,
                        centerPos: this.centerPos,
                    })
                    listEmitter.emit(HOTEL_LIST_UPDATE_ONLINE_MAP_COMPATIBLE_MAP_EVENT, this.compatibleMap)
                }
                // online平台end
                await this.autoLoadHotelList()
            } else {
                this.pageStatus = statusEnum.ERROR
                this.footerStatus = footerEnum.SUCCESS
                this.responseErrorHandle(response?.responseCode)
                setHotelListCallBack && this.setHotelList(setHotelListCallBack)
                this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_HOTEL_LIST_ERROR, {
                    pageNo: requestParams['pageNo'],
                    responseCode: response?.responseCode,
                    responseDesc: response?.responseDesc,
                })
            }
        } catch (e) {
            this.pageStatus = statusEnum.ERROR
            this.footerStatus = footerEnum.SUCCESS
            setHotelListCallBack && this.setHotelList(setHotelListCallBack)
            this.logError(e)
        } finally {
            if (this.isOnline()) {
                this.updateFooterDisplayStyle()
            }
        }
    }

    /**
     * 查询：分页查询酒店列表
     */
    public loadMoreHotelList = async (arg?: ILoadMoreHotelList): Promise<ISearchHotelResponse | void> => {
        const { isTryAgain } = arg || {
            isTryAgain: false,
            isMapMode: false,
        }
        if (this.footerStatus === footerEnum.ERROR) {
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FOOTER_STATUS_IS_ERROR)
        }
        const { setHotelListCallBack, setFooterStatusCallBack, isLastPage, timstamp } = this
        if (isLastPage) {
            return Promise.resolve()
        }
        this.footerStatus = footerEnum.LOADING
        setFooterStatusCallBack && this.setFooterStatus(setFooterStatusCallBack)
        const requestParams = this.handleRequestParams()
        if (!isTryAgain) {
            requestParams['pageNo'] = this.pageNo + 1
        }
        this.logDevTrace(
            LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_MORE_HOTEL_LIST_REQ_TRAVEL_POLICY_INFO_PARAMS,
            requestParams[TRACE_TRAVEL_POLICY_INFO_KEY_STR],
        )
        if (this.isOnline()) {
            const extraTraceObj = {}
            TRACE_SEARCH_ONLINE_KEY.forEach(key => {
                extraTraceObj[key] = requestParams[key]
            })
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_MORE_HOTEL_LIST_REQ_ONLINE_EXTRA_PARAMS, extraTraceObj)
        }
        const traceObj = {
            pageNo: requestParams['pageNo'],
        }
        TRACE_SEARCH_KEY.forEach(key => {
            traceObj[key] = requestParams[key]
        })
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_MORE_HOTEL_LIST_REQ_SEARCH_PARAMS, traceObj)
        try {
            const response: ISearchHotelResponse = await getList(requestParams as ISearchHotelRequest)
            this.geoId = requestParams['geoId']
            this.requestid = response?.traceId || null
            this.responseCode = response?.responseCode
            this.responseDesc = response?.responseDesc!
            if (response?.responseCode === 20000) {
                this.logTrace(LOG_TRACE_KEYIDS.HOTEL_LIST_FETCH_HOTEL_LIST_SUCCESS, {
                    requestid: this.requestid,
                    timestamp: timstamp,
                    cityid: this.geoId,
                })

                // 接口数据处理start
                this.hotelList = this.hotelList.concat(
                    handleHotelList({
                        hotelList: JSON.parse(JSON.stringify(response?.hotelList || [])),
                        customizeMap: response?.customizeMap,
                        isInt: this.isInt,
                        Language: this.language,
                        sourceFrom: getBase().sourceFrom,
                    }),
                )
                // 接口数据处理end

                // 列表数据赋值start
                // fix 复工复产未撑满6条时自动加载数据，请求三次后还没有撑满6条数据默认为没有数据了
                const autoIsLastPage =
                    this.autoLoadPageNum >= this.autoLoadTotalPageNum && this.hotelList?.length < this.autoLoadSize
                this.pageNo++
                this.isLastPage = !!response.isLastPage
                this.centerPos = response?.centerPos || null
                if (!this.isLastPage && response?.hotelList?.length === 0) {
                    this.footerStatus = footerEnum.LOADING_STOP
                } else {
                    this.footerStatus = autoIsLastPage || this.isLastPage ? footerEnum.NO_MORE : footerEnum.SUCCESS
                }
                const hasHotelList = this.hotelList?.length > 0
                if (hasHotelList) {
                    this.emptyStatus = emptyEnum.NOT_EMPTY
                } else if (!hasHotelList) {
                    this.emptyStatus = this.hasFilter ? emptyEnum.FILTER_EMPTY : emptyEnum.SEARCH_EMPTY
                }
                setFooterStatusCallBack && this.setFooterStatus(setFooterStatusCallBack)
                setHotelListCallBack && this.setHotelList(setHotelListCallBack)
                // 列表数据赋值end
                // online平台start
                if (this.isOnline()) {
                    listEmitter.emit(HOTEL_LIST_UPDATE_ONLINE_MAP_HOTELS_EVENT, {
                        hotelList: this.hotelList,
                        centerPos: this.centerPos,
                    })
                }
                await this.autoLoadHotelList()
                // online平台end
                return Promise.resolve(response)
            } else {
                this.footerStatus = footerEnum.ERROR
                this.responseErrorHandle(response?.responseCode)
                setHotelListCallBack && this.setHotelList(setHotelListCallBack)
                this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_FETCH_HOTEL_LIST_ERROR, {
                    pageNo: requestParams['pageNo'],
                    responseCode: response?.responseCode,
                    responseDesc: response?.responseDesc,
                })
            }
            return Promise.resolve()
        } catch (e) {
            this.footerStatus = footerEnum.ERROR
            setHotelListCallBack && this.setHotelList(setHotelListCallBack)
            this.logError(e)
        } finally {
            if (this.isOnline()) {
                this.updateFooterDisplayStyle()
            }
        }
    }

    /**
     * 接口error处理
     */
    private responseErrorHandle = (responseCode: number) => {
        if (!responseCode) {
            return
        }
        if (loginErrorCode.includes(responseCode)) {
            // 跳转入登录页
            this.loginModalVisible = true
        } else if (reloadSearchErrorCode.includes(responseCode)) {
            // 日期过期，重载页面
            this.reloadSearchModalVisible = true
        } else if (backSearchErrorCode.includes(responseCode)) {
            // 返回查询页
            this.backSearchModalVisible = true
        }
    }

    /**
     * fix 复工复产过滤后只有若干条(现在默认写成6条)不能撑满一屏时无法触发上拉加载, 最多请求三次(包括首次查询)，三页之后数据还是小于6条默认为无更多数据
     */
    private autoLoadHotelList = async () => {
        const needAutoLoad = this.hotelList?.length < this.autoLoadSize && !this.isLastPage
        if (!this.isMapMode && needAutoLoad && this.autoLoadPageNum < this.autoLoadTotalPageNum) {
            this.autoLoadPageNum++
            await this.loadMoreHotelList()
        }
    }

    /**
     * 查询：虚拟卡随心订会员绑定接口
     */
    public searchOutputInfo = async () => {
        try {
            const { isIntl: isInt } = this.getEnvironment()
            const requestParams = {
                isOverSea: isInt,
            }
            const response: ISearchOutputResponse = await getOutputInfo(requestParams as ISearchOutputRequest)
            if (response.responseCode === 20000) {
                this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_OUTPUT_INFO_RESPONSE, {
                    needBindTrip: response.needBindTrip,
                    isShowSXD: response.isShowSXD,
                    isVirtualModle: response.isVirtualModle,
                })
                this.isVirtualModle = response.isVirtualModle
                // 会员绑定在英文环境下不弹窗(会员绑定没有英文环境)
                this.needBindTrip = this.language === localeEnum.enUS ? false : response.needBindTrip
                this.isShowSXD = response.isShowSXD
                listEmitter.emit(HOTEL_LIST_INIT_VIRTUAL_EVENT, {
                    isVirtualModle: response.isVirtualModle,
                    virtualModleShark: this.virtualModleShark,
                })
            }
        } catch (e) {
            //
        }
    }

    /**
     * 定制需求: 展示差标
     */
    public isEmitShowTravelStandards = (): boolean => {
        const customizeArr = Object.keys(this.customizeMap || {})
        const nextShowTravelStandards = !customizeArr.some(k => k === HIDE_TRAVEL_STANDARDS)
        if (this.showTravelStandards !== nextShowTravelStandards && nextShowTravelStandards) {
            this.logDevTrace(LOG_DEV_TRACE_KEYS.ONLINE_HOTEL_LIST_EMIT_SHOW_TRAVEL_STANDARDS)
            this.showTravelStandards = true
            return true
        } else {
            this.logDevTrace(LOG_DEV_TRACE_KEYS.ONLINE_HOTEL_LIST_NOT_EMIT_SHOW_TRAVEL_STANDARDS)
            return false
        }
    }

    /**
     * 查询列表接口(切换目的地、日期、关键字、筛选排序)
     */
    private searchHotelListByCustomDestinationAction = async (args?: ICustomConditionRequestParams) => {
        const { getEnvType } = getBase()
        const envType = getEnvType()
        if (envType !== 'prd') {
            console.log('searchHotelListByCustomDestinationAction:', args)
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_SEARCH_BY_CUSTOM_DESTINATION_ACTION, args)
        const {
            moduleType,
            coordinate,
            checkIn,
            checkOut,
            geoId,
            geoCategoryId,
            geoCategoryName,
            keyword,
            adultQuantity,
            roomQuantity,
            selectedSearchItem,
            sortFilter,
            otherFilter,
            priceAndStarFilter,
            quickFilter,
            positionSelectedItem,
            source,
            type,
            keywordInfoJson,
            // isOverSea,
            isDisableSearchHotelList,
        } = args || {}
        this.moduleType = moduleType || null
        this.coordinate = this.getCoordinateRequestParam(coordinate)?.coordinate || null
        if (geoId && !isNaN(Number(geoId))) {
            this.geoId = Number(geoId)
        }
        if (geoCategoryId && !isNaN(Number(geoCategoryId))) {
            this.geoCategoryId = Number(geoCategoryId)
        }
        if (geoCategoryName) {
            this.geoCategoryName = geoCategoryName
        }
        if (checkIn) {
            this.checkIn = checkIn
        }
        if (checkOut) {
            this.checkOut = checkOut
        }
        if (keyword !== undefined) {
            this.keyword = keyword
        }
        if (adultQuantity !== undefined && !isNaN(Number(adultQuantity))) {
            this.adultQuantity = Number(adultQuantity)
        }
        if (roomQuantity !== undefined && !isNaN(Number(roomQuantity))) {
            this.roomQuantity = Number(roomQuantity)
        }
        // if (isOverSea === false || isOverSea === true) {
        //     this.isInt = isOverSea
        // }
        const { sourceId = '', text = '' } = selectedSearchItem || {}
        if (this.moduleType === moduleTypeEnum.KEYWORD) {
            if (sourceId) {
                this.selectedSearchItem = {
                    sourceId,
                    text,
                }
            } else {
                this.selectedSearchItem = null
            }
            this.keywordsType = type || null
            this.keywordsSource = source || null
            this.keywordInfoJson = keywordInfoJson || null
        }
        if (sortFilter !== undefined) {
            this.sortFilter = sortFilter
        }
        if (otherFilter !== undefined) {
            this.otherFilter = otherFilter
        }
        if (priceAndStarFilter !== undefined) {
            this.priceAndStarFilter = priceAndStarFilter
        }
        if (positionSelectedItem !== undefined) {
            this.positionSelectedItem = positionSelectedItem
            const sourceId = (positionSelectedItem || []).find(i => i.sourceId?.includes('LOCATION.POSITION.'))
                ?.sourceId
            let districtId = 0
            if (typeof sourceId === 'string' && sourceId.includes('LOCATION.POSITION.')) {
                const matchResult = sourceId.match(/(\d+)/g)
                if (matchResult !== null) {
                    districtId = Number(matchResult[0])
                }
            }
            if (!this.travelPolicyInfo) {
                this.travelPolicyInfo = {
                    guestMode: false,
                    GeoCategory: [],
                    guestModeParams: [],
                }
            }
            this.travelPolicyInfo.GeoCategory = districtId ? [{ geoCategoryId: 4, geoId: districtId }] : []
        }
        if (quickFilter !== undefined) {
            this.quickFilter = quickFilter
        }
        this.EmitterNotice()
        // 地图模式，关键字不重复刷新接口
        if (this.moduleType === moduleTypeEnum.KEYWORD && this.isMapMode) {
            return
        }
        if (!isDisableSearchHotelList) {
            await this.searchHotelList()
        }
        if (this.isMapMode) {
            EmitterAction({
                type: emitterTypeEnum.emit,
                event: HOTEL_LIST_UPDATE_MAP_DATA_EVENT,
                action: this.getMapData(),
            })
        }
    }

    /**
     * 更新公告event
     */
    EmitterNotice() {
        const { geoId, geoCategoryId, checkIn, checkOut, isVirtualModle } = this
        EmitterAction({
            type: emitterTypeEnum.emit,
            event: HOTEL_LIST_CHANGE_NOTICE_EVENT,
            action: {
                site: '2',
                geoId,
                geoCategoryId,
                startDate: checkIn,
                endDate: checkOut,
                isVirtualModle,
            },
        })
    }

    /**
     * 获取接口入参经纬度
     */
    private getCoordinateRequestParam = (coordinate?: Coordinate | null, onlyRead?: boolean): ICoordinateMapItem => {
        if (!onlyRead) {
            if (this.moduleType && this.moduleType in moduleTypeEnum) {
                this.coordinateMap[this.moduleType] = {
                    ...this.coordinateMap[this.moduleType],
                    coordinate: coordinate,
                    timeStamp: coordinate ? new Date().getTime() : null,
                }
            }
        }
        let newCoordinateMapItem: ICoordinateMapItem = {}
        for (const key in this.coordinateMap) {
            const item = this.coordinateMap[key]
            const isValidCoordinate =
                item &&
                item['coordinate'] &&
                item['coordinate']['longitude'] &&
                item['coordinate']['latitude'] &&
                item['timeStamp']
            if ((!newCoordinateMapItem || Object.keys(newCoordinateMapItem).length === 0) && isValidCoordinate) {
                newCoordinateMapItem = item
            } else if (isValidCoordinate && item['timeStamp'] > (newCoordinateMapItem.timeStamp || 0)) {
                newCoordinateMapItem = item
            }
        }
        return newCoordinateMapItem
    }

    /**
     * 地图切换城市，更新coordinateMap
     * @param geoInfo
     */
    private updateCoordinateMapByChangeCityAction = (geoInfo: GeoInfo) => {
        if (geoInfo.geoId) {
            this.coordinateMap = {
                DESTINATION: {
                    coordinate: null,
                    timeStamp: null,
                },
                KEYWORD: {
                    coordinate: null,
                    timeStamp: null,
                },
                FILTER: {
                    coordinate: null,
                    timeStamp: null,
                },
                MAP: {
                    coordinate: null,
                    timeStamp: null,
                },
            }
        }
    }

    /**
     * 查询列表接口(地图模式)
     */
    private searchHotelListByMapAction = async (args: ISearchByMap) => {
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_SEARCH_BY_MAP_ACTION, args)
        const { isInitMap, isFirstPage, callback, arg } = args
        this.moduleType = moduleTypeEnum.MAP
        const { coordinate, screenDistance, geoCategoryId, geoCategoryName, geoId } = arg || {}
        this.coordinate = this.getCoordinateRequestParam(coordinate)?.coordinate || null
        this.screenDistance = screenDistance || null
        if (geoId) {
            this.geoId = geoId
        }
        if (geoCategoryId) {
            this.geoCategoryId = geoCategoryId
        }
        if (geoCategoryName) {
            this.geoCategoryName = geoCategoryName
        }
        if (isInitMap) {
            this.setMapCallBack(callback)
        } else {
            if (isFirstPage) {
                await this.searchHotelList()
                this.setMapCallBack(callback)
            } else {
                const response: ISearchHotelResponse | void = await this.loadMoreHotelList({
                    isMapMode: true,
                })
                if (response && response.responseCode === 20000) {
                    callback &&
                        callback(
                            this.getMapData(
                                handleHotelList({
                                    hotelList: JSON.parse(JSON.stringify(response.hotelList || [])),
                                    customizeMap: response?.customizeMap,
                                    isInt: this.isInt,
                                    Language: this.language,
                                    sourceFrom: getBase().sourceFrom,
                                }),
                            ),
                        )
                } else {
                    this.setMapCallBack(callback)
                }
            }
        }
    }

    /**
     * get 地图模式需要的数据
     */
    private getMapData = (hotelList?: HotelListItemType[]): IMapSearchCallbackArg => {
        return {
            responseCode: this.responseCode,
            responseDesc: this.responseDesc,
            hotelList: this.responseCode !== 20000 ? [] : hotelList ? hotelList : this.hotelList,
            centerPos: this.centerPos,
            pageStatus: this.pageStatus,
            emptyStatus: this.emptyStatus,
            isLastPage: this.isLastPage,
            isInt: this.isInt,
            coordinate: this.coordinate || null,
            coordinateName:
                this.positionSelectedItem && this.positionSelectedItem[0]
                    ? this.positionSelectedItem[0].text || null
                    : null,
        }
    }

    /**
     * update isMapMode
     */
    private changeMapModeAction = (isShowMap: boolean) => {
        this.isMapMode = isShowMap
        this.setIsMapModeCallback && this.setIsMapMode(this.setIsMapModeCallback)
    }

    /**
     * update 已筛选
     */
    private updateHasFilterAction = (hasFilter: boolean) => {
        this.hasFilter = hasFilter
        this.setHasFilterCallback && this.setHasFilter(this.setHasFilterCallback)
    }

    /**
     * 回显查询页数据处理
     */
    private updateSearchStorageAction = () => {
        const value = {
            city: {
                cityType: this.isInt ? 1 : 0,
                id: this.geoId,
                name: this.geoCategoryName,
            },
            Sdate: {
                date: this.checkIn,
                dateView: this.handleMDShortDate(this.checkIn),
                week: this.handleWeek(this.checkIn),
            },
            Edate: {
                date: this.checkOut,
                dateView: this.handleMDShortDate(this.checkOut),
                week: this.handleWeek(this.checkOut),
            },
        }
        const text = this.keyword
        const categoryId =
            this.keywordsType !== undefined && this.keywordsType !== null ? this.keywordsType : this.keywordsSource
        if (text || categoryId) {
            value['searchKeywords'] = {
                id: this.selectedSearchItem?.sourceId,
                text: text,
                categoryId,
            }
        }
        const { Storage, CacheStorage } = getBase()
        Storage.save({
            type: STORAGE_LOCAL_STORAGE,
            domain: STORAGE_DOMAIN_HOTEL,
            key: STORAGE_KEY_HOTEL_LIST_BACK_DATA,
            value,
        })
        if (this.isCRN && H5EventPlugin) {
            H5EventPlugin.sendEvent(
                JSON.stringify({ eventName: 'HOTEL_HOME_ECHO_SEARCH_INFO_EVENT', eventInfo: value }),
            )
        } else {
            CacheStorage &&
                CacheStorage.save({
                    type: STORAGE_LOCAL_STORAGE,
                    domain: STORAGE_DOMAIN_HOTEL,
                    key: STORAGE_KEY_HOTEL_LIST_BACK_DATA,
                    value: JSON.stringify(value),
                })
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_BACK_LEOMA, value)
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_BACK_STORAGE, value)
        this.backSaveSearchStorage()
    }
    /**
     * 物理返回判断是地图页需要先返回到地图页
     */
    async backSaveSearchStorage() {
        const searchValue = (await getHotelListSearchParams()) || {}
        searchValue.mapMode = false
        saveMultiSearchStorage(searchValue)
    }

    /**
     * 日期格式化处理
     */
    private handleMDShortDate = (date: string | null): string | null => {
        if (!date) {
            return null
        }
        const IBUDate = new IBUL10nDateFormatterLite(this.getSharkLocale(), date)
        return IBUDate.mdShortString()
    }

    /**
     * 处理 今天、明天、周几 返回对应shark
     */
    private handleWeek = (date: string | null): string | null => {
        if (!date) {
            return date
        }
        const num = diffTime(date, formatDate(new Date()))
        if (num === 0) {
            return this.todayShark
        } else if (num === -1) {
            return this.tomorrowShark
        } else if (num === -2) {
            return this.acquiredShark
        }
        const IBUDate = new IBUL10nDateFormatterLite(this.getSharkLocale(), date)
        return IBUDate.eShortString()
    }

    /**
     * 设置列表数据
     */
    public setHotelList = (callBack: (o: ISetHotelList) => void) => {
        callBack({
            hotelList: this.hotelList,
            centerPos: this.centerPos,
            pageStatus: this.pageStatus,
            footerStatus: this.footerStatus,
            emptyStatus: this.emptyStatus,
            isInt: this.isInt,
            pageNo: this.pageNo,
            loginModalVisible: this.loginModalVisible,
            reloadSearchModalVisible: this.reloadSearchModalVisible,
            backSearchModalVisible: this.backSearchModalVisible,
        })
    }

    /**
     * 设置广告位置
     */
    public setAppAdvertisementLocation = (noticeLength: number, isInit: boolean, index?: number): number => {
        if (this.isMapMode) return 0
        if (isInit && this.isVirtualModle) {
            return 1
        }
        if (isInit && noticeLength === 0) {
            return 1
        }
        // 公共小于2条直接显示
        if (isInit && noticeLength === 1) {
            return 2
        }
        // 列表数据为空直接显示
        if (isInit && noticeLength > 2 && !this.hotelList.length) {
            return 2
        }
        // 列表数据大于三条显示在第三条下面
        if (!isInit && noticeLength > 2 && this.hotelList.length > 3 && index === 2) {
            return 1
        }
        // 列表数据小于三条显示在最后一条下面
        if (!isInit && noticeLength > 2 && this.hotelList.length < 3 && index === this.hotelList.length - 1) {
            return 1
        }
        return 0
    }

    /**
     * 设置pageStatus
     */
    private setPageStatus = (callBack: (o: ISetPageStatus) => void) => {
        callBack({
            pageStatus: this.pageStatus,
        })
    }

    /**
     * 设置footerStatus
     */
    private setFooterStatus = (callBack: (o: ISetFooterStatus) => void) => {
        callBack({
            footerStatus: this.footerStatus,
        })
    }

    /**
     * 设置地图数据
     */
    private setMapCallBack = (callback: (callbackArg: IMapSearchCallbackArg) => void) => {
        callback && callback(this.getMapData())
    }
    /**
     * 设置isMapMode
     */
    private setIsMapMode = (callBack: (o: ISetIsMapMode) => void) => {
        callBack({
            isMapMode: this.isMapMode,
        })
    }

    /**
     * 设置hasFilter
     */
    private setHasFilter = (callBack: (o: ISetHasFilter) => void) => {
        callBack({
            hasFilter: this.hasFilter,
        })
    }

    /**
     * 随心订、会员绑定
     */
    private setOutputInfo = (callBack: (o: ISetOutputInfo) => void) => {
        callBack({
            vipBindModelVisible: this.vipBindModelVisible,
            orderLikeModelVisible: this.isPublic ? this.orderLikeModelVisible : false,
        })
    }

    /**
     * 随心订、会员绑定 ls占位
     */
    public getOutputInfoFirstTime = async (): Promise<[boolean | null, boolean | null] | undefined> => {
        let hotelListSearch: [boolean | null, boolean | null] | undefined = [null, null]
        try {
            const { Storage } = getBase()
            hotelListSearch = (await Storage.load<[boolean | null, boolean | null] | undefined>({
                type: STORAGE_LOCAL_STORAGE,
                domain: STORAGE_DOMAIN_HOTEL,
                key: STORAGE_KEY_HOTEL_LIST_OUTPUT_INFO_FIRST_TIME,
            })) || [null, null]
            if (typeof hotelListSearch === 'string') {
                hotelListSearch = JSON.parse(hotelListSearch)
            }
        } catch (e) {
            console.log('getSearchOutputInfoFirstTime:', e)
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_OUTPUT_INFO_FIRST_TIME_STORAGE, hotelListSearch)
        return hotelListSearch
    }

    public setOutputInfoFirstTime = value => {
        const { Storage } = getBase()
        Storage.save({
            type: STORAGE_LOCAL_STORAGE,
            domain: STORAGE_DOMAIN_HOTEL,
            key: STORAGE_KEY_HOTEL_LIST_OUTPUT_INFO_FIRST_TIME,
            value,
        })
    }

    /**
     * 关闭随心订
     */
    public closeOrderLikeModal = async () => {
        let outputInfoFirstTime = await this.getOutputInfoFirstTime()
        if (outputInfoFirstTime && !Array.isArray(outputInfoFirstTime)) {
            outputInfoFirstTime = [null, null]
        }
        if (outputInfoFirstTime && outputInfoFirstTime.length > 0) {
            outputInfoFirstTime[0] = true
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_CLOSE_ORDER_LIKE_MODAL, outputInfoFirstTime)
        this.setOutputInfoFirstTime(outputInfoFirstTime)
    }

    /**
     * 关闭会员绑定
     */
    public closeVipBindModal = async () => {
        let outputInfoFirstTime = await this.getOutputInfoFirstTime()
        if (outputInfoFirstTime && !Array.isArray(outputInfoFirstTime)) {
            outputInfoFirstTime = [null, null]
        }
        if (outputInfoFirstTime && outputInfoFirstTime.length > 0) {
            outputInfoFirstTime[1] = true
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_CLOSE_VIP_BIND_MODAL, outputInfoFirstTime)
        this.setOutputInfoFirstTime(outputInfoFirstTime)
    }

    /**
     * 跳转详情
     * @param item
     */
    public handleClicktoDetail = (item: HotelListItemType, lbdLoding?: (reg: boolean) => void) => {
        const { sourceFrom } = getBase()
        const { isIntl = false, PU = '', isPublic = true } = this.getEnvironment()
        const { baseInfo, priceInfo } = item || {}
        const { hasContract, hid, masterHotelId, detailUrl = '' } = baseInfo || {}
        const { minPriceInfo } = priceInfo || {}
        const { customPrice } = minPriceInfo || {}
        const {
            geoId,
            geoCategoryName,
            handleRequestParams,
            keyword,
            compatibleMap,
            isMapMode: mapMode,
            filterList,
        } = this
        this.logTrace(LOG_TRACE_KEYIDS.HOTEL_LIST_TO_DETAIL_ITEM, {
            requestid: this.requestid,
            hotelid: masterHotelId,
            price: customPrice,
            cityid: geoId,
        })
        // h5跳转
        if (sourceFrom === sourceFromEnum.H5) {
            const { CacheData = '', AppFilterKey = '' } = compatibleMap || {}
            const { checkIn, checkOut } = handleRequestParams() as ISearchHotelRequest
            const paramsInitValue = {}
            PARAMS_INIT_KEY.forEach(key => {
                paramsInitValue[key] = this[key]
            })
            const params: IHotelListToh5Detail = {
                CityType: +isIntl,
                CityState: +isIntl,
                AppFilterKey,
                hasContract,
                hid,
                masterHotelId,
                geoId,
                geoCategoryName,
                keyword,
                CacheData,
                mapMode,
                checkIn,
                checkOut,
                PU,
            }
            if (filterList) {
                params.filterList = filterList
            }
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_TO_DETAIL_APP, params)
            h5Detail(params, paramsInitValue, isPublic, lbdLoding)
            return
        }
        // online跳转
        if (sourceFrom === sourceFromEnum.Online) {
            const { compatibleMap, getAppLanguage, getEnvironment, getHostUrl } = this || {}
            const { FilterKey = '', ServerData = '' } = compatibleMap || {}
            const { sToken: Stoken = '' } = getEnvironment() || {}
            const Language = getAppLanguage()
            const params: IHotelListToOnlineDetail = {
                detailUrl: joinPath(getHostUrl(), detailUrl),
                FilterKey,
                Language,
                Stoken,
                ServerData,
            }
            this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_TO_DETAIL_ONLINE, params)
            onlineDetail(params)
        }
    }

    private setFilterListAction = (filterList: IGetFilterListResponse) => {
        this.filterList = filterList
    }

    /**
     * 日期过期刷新reload页面
     */
    public dateExpiredReload = () => {
        if (window?.location?.reload) {
            window.location.reload()
        }
    }

    /**
     * 未登录 前往登录页
     */
    public goLogin = async () => {
        const { OpenURL, sourceFrom, extractHostUrlFromEnv } = getBase()
        const logInLinkHostPrefix = (await extractHostUrlFromEnv())?.hostUrl
        let url = ''
        if (sourceFrom === sourceFromEnum.H5) {
            url = `${logInLinkHostPrefix}/m/dy_3_BeforeLogin/Login/Login`
        } else if (sourceFrom === sourceFromEnum.Online) {
            url = `${logInLinkHostPrefix}/biztravel/login/index`
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_BACK_TO_LOGIN, url)
        OpenURL(url)
    }

    /**
     * 会员绑定
     */
    public bindAccount = async () => {
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_BIND_ACCOUNT)
        const { sourceFrom } = getBase()
        if (sourceFrom === sourceFromEnum.H5) {
            await this.getH5CtripToken()
        } else if (sourceFrom === sourceFromEnum.Online) {
            this.onlineBindCount()
        }
    }

    /**
     * H5 获取会员绑定跳转路径
     */
    private getH5CtripToken = async () => {
        const token = this.getToken()
        const languageEnum = {
            zh_CN: 'CHS',
            en_US: 'EN',
        }
        const { Language = 'zh_CN', isPublic } = this.getEnvironment()
        let backurl = window?.location?.href || ''
        backurl = backurl + (backurl.indexOf('?') > -1 ? '&goBack=true' : '?goBack=true')
        const requestParams: IGetCtripTokenRequest = {
            token,
            backurl,
            CorpPayType: isPublic ? 'public' : 'private',
            language: languageEnum[Language],
            jumpSite: 'BindAccount',
        }
        try {
            const response: IGetCtripTokenResponse = await getCtripToken(requestParams)
            const CTicket = response?.Response?.CTicket
            SetCookie({
                key: 'cticket',
                value: CTicket,
            })
            const URL = response?.Response?.URL
            if (response?.Result && response?.Response && URL) {
                const { OpenURL, sourceFrom } = getBase()
                if (sourceFrom === sourceFromEnum.H5) {
                    const secretRequestParams: ISsoCrossSetCookieRequest = {
                        token,
                        CorpPayType: isPublic ? 'public' : 'private',
                        language: languageEnum[Language],
                    }
                    const secretResponse: ISsoCrossSetCookieResponse = await requestSecret(secretRequestParams, CTicket)
                    if (secretResponse.returnCode === 500) {
                        // TODO toast 权限不足
                        console.log(this.insufficientPermissionsShark)
                        await this.updateSetOutputInfoFirstTime()
                        return
                    } else if (secretResponse.returnCode === 530) {
                        // TODO toast 验证未通过，跳转失败
                        console.log(this.verificationAndJumpFailedShark)
                        await this.updateSetOutputInfoFirstTime()
                        return
                    }
                }
                this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_BIND_ACCOUNT_URL, URL)
                removeFromCRNSearchStorage()
                OpenURL(URL)
            } else {
                await this.updateSetOutputInfoFirstTime()
            }
        } catch (e) {
            await this.updateSetOutputInfoFirstTime()
        }
    }

    private updateSetOutputInfoFirstTime = async () => {
        const outputInfoFirstTime = await this.getOutputInfoFirstTime()
        if (outputInfoFirstTime && outputInfoFirstTime.length > 0) {
            outputInfoFirstTime[1] = null
        }
        this.setOutputInfoFirstTime(outputInfoFirstTime)
    }

    /**
     * 动态引入sdk
     */
    public setBindAccountJS = () => {
        try {
            const { getEnvType } = getBase()
            let host = '//webresource.c-ctrip.com'
            switch (getEnvType()) {
                case 'fat':
                    host = '//webresource.fws.qa.nt.ctripcorp.com'
                    break
                case 'uat':
                    host = '//webresource.uat.qa.nt.ctripcorp.com'
                    break
                default:
                    break
            }
            const url = host + '/ares2/basebiz/cusersdk_accountmanage/*/default.debug/AccountManageSDK.js?expires=1d'
            const script = document.createElement('script')
            script.setAttribute('language', 'javascript')
            script.setAttribute('type', 'text/javascript')
            script.setAttribute('charset', 'utf-8')
            script.setAttribute('src', url)
            document.getElementsByTagName('head')[0].appendChild(script)
        } catch (e) {
            console.log('setBindAccountJS:' + e)
        }
    }

    /**
     * online绑定账号
     * returnCode的取值说明如下：0: 成功；600: 用户关闭了弹窗
     */
    private onlineBindCount = () => {
        const params = {
            bindAccountStrategyCode: '8975B588C0CC44DA', //绑定策略码，商旅：8975B588C0CC44DA
            bindAccountAccessCode: 'BC35B588C0CC44DA', //绑定接入码，商旅：BC35B588C0CC44DA
            showView: 'pwd', //优先展示哪种校验方式，pwd: 账号密码 mobile:手机号动态码, 默认pwd
        }
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            const accountManageUtil = new CAccountManage()
            accountManageUtil.crossSystemApi.showBindMask(params, this.onlineBindCountCallback)
        } catch (e) {
            console.log(e)
        }
    }

    private onlineBindCountCallback = data => {
        if (data.returnCode === 0) {
            console.log('success')
        } else if (data.returnCode === 600) {
            console.log('close modal')
        }
    }

    /**
     * 获取token，会员绑定接口使用
     */
    private getToken = () => {
        let h5_environment = window.localStorage.getItem('corp_common_corp_app_environment') || { token: '' }
        let token = ''
        if (typeof h5_environment === 'string') {
            h5_environment = JSON.parse(h5_environment)
        }
        if (typeof h5_environment !== 'string') {
            token = h5_environment.token
        }
        if (!token) {
            token = window.localStorage.getItem('token') || ''
        }
        return token
    }

    /**
     * close reloadSearchModalVisible
     */
    public closeLoginModalVisible = () => {
        this.loginModalVisible = false
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_CLOSE_LOGIN_MODAL)
    }

    /**
     * close reloadSearchModalVisible
     */
    public closeReloadSearchModalVisible = () => {
        this.reloadSearchModalVisible = false
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_CLOSE_RELOAD_SEARCH_MODAL)
    }
    /**
     * close reloadSearchModalVisible
     */
    public closeBackSearchModalVisible = () => {
        this.backSearchModalVisible = false
        if (this.isOnline()) {
            window.location.href =
                '//' + location.host + '/hotel-online/home/?reslang=' + onlineLocale[this.language || 'zh_CN']
        }
        this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_CLOSE_BACK_SEARCH_MODAL)
    }

    /**
     * update footer display style
     */
    private updateFooterDisplayStyle = () => {
        if (document && document.getElementById && document.getElementById('base_ft')) {
            const ft = document.getElementById('base_ft')
            const nextStyle = this.isLastPage ? 'inherit' : 'none'
            if (ft?.style?.display !== nextStyle) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                ft.style.display = nextStyle
                this.logDevTrace(LOG_DEV_TRACE_KEYS.HOTEL_LIST_UPDATE_FOOTER_DISPLAY_STYLE, nextStyle)
            }
        }
    }
}

export { ListModel, IListModelProps }
