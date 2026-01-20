import ImageToBase64 from 'image-to-base64';
import { customAlphabet } from 'nanoid';
import { formatISO } from 'date-fns';
import pkg from 'crypto-js';
const { HmacSHA256 } = pkg;

export class CoolsmsMessageService {
	private readonly baseUrl = 'https://api.coolsms.co.kr';
	private readonly apiKey: string;
	private readonly apiSecret: string;
	private readonly authInfo: AuthInfo;

	constructor(apiKey: string, apiSecret: string) {
		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
		this.authInfo = {
			apiKey,
			apiSecret
		};
	}

	/**
	 * 단일 메시지 발송 기능
	 * @param message 메시지(문자, 알림톡 등)
	 * @param appId appstore용 app id
	 */
	async sendOne(message: Message, appId?: string): Promise<SingleMessageSentResponse> {
		const parameter = new SingleMessageSendingRequest(message, false, appId);
		const requestConfig: RequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/messages/v4/send`
		};
		return defaultFetcher<SingleMessageSendingRequest, SingleMessageSentResponse>(
			this.authInfo,
			requestConfig,
			parameter
		);
	}

	/**
	 * 파일(이미지) 업로드
	 * 카카오 친구톡 이미지는 500kb, MMS는 200kb, 발신번호 서류 인증용 파일은 2mb의 제한이 있음
	 * @param filePath 해당 파일의 경로 또는 접근 가능한 이미지 URL
	 * @param fileType 저장할 파일의 유형, 예) 카카오 친구톡 용 이미지 -> KAKAO, MMS용 사진 -> MMS, 발신번호 서류 인증에 쓰이는 문서 등 -> DOCUMENT, RCS 이미지 -> RCS
	 * @param name 파일 이름
	 * @param link 파일 링크, 친구톡의 경우 필수 값
	 */
	async uploadFile(
		filePath: string,
		fileType: FileType,
		name?: string,
		link?: string
	): Promise<FileUploadResponse> {
		const encodedFile = await ImageToBase64(filePath);
		const requestConfig: RequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/storage/v1/files`
		};
		const parameter: FileUploadRequest = {
			file: encodedFile,
			type: fileType,
			name,
			link
		};
		return defaultFetcher<FileUploadRequest, FileUploadResponse>(
			this.authInfo,
			requestConfig,
			parameter
		);
	}
}

type DefaultRequest = {
	url: string;
	method: string;
};

export async function defaultFetcher<T, R>(
	authParameter: AuthenticationParameter,
	request: DefaultRequest,
	data?: T
): Promise<R> {
	const authorizationHeaderData = getAuthInfo(authParameter);
	return await fetch(request.url, {
		headers: {
			Authorization: authorizationHeaderData,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data),
		method: request.method
	}).then<R>(async (res) => {
		if (res.status >= 400 && res.status < 500) {
			const errorResponse: ErrorResponse = await res.json();
			throw new DefaultError(errorResponse.errorCode, errorResponse.errorMessage);
		} else if (res.status >= 500) {
			const responseText = await res.text();
			throw new DefaultError('UnknownException', responseText);
		}
		try {
			return res.json();
		} catch (exception) {
			throw new Error(await res.text());
		}
	});
}

enum AuthenticateType {
	API_KEY
}

export type AuthenticationParameter = {
	apiKey?: string;
	apiSecret?: string;
};

/**
 * Get Authenticate Information for CoolSMS Requests
 * @param authenticationParameter
 * @param authType
 * @return string "Authorization value
 */
export function getAuthInfo(
	authenticationParameter: AuthenticationParameter,
	authType: AuthenticateType = AuthenticateType.API_KEY
): string {
	const { apiKey, apiSecret } = authenticationParameter;
	switch (authType) {
		case AuthenticateType.API_KEY:
		default:
			const salt = customAlphabet(
				'1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
				32
			)();
			const date = formatISO(new Date());
			const hmacData = date + salt;
			if (!apiKey || !apiSecret || apiKey === '' || apiSecret === '') {
				throw new ApiKeyError('Invalid API Key Error');
			}
			const signature = HmacSHA256(hmacData, apiSecret).toString();
			return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
	}
}

export type ErrorResponse = {
	errorCode: string;
	errorMessage: string;
};

export class InvalidDateError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidDateError';
	}
}

export class ApiKeyError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidApiKeyError';
	}
}

export class DefaultError extends Error {
	constructor(errorCode: string, errorMessage: string) {
		super(errorMessage);
		this.name = errorCode;
	}
}

export type FileType = 'KAKAO' | 'MMS' | 'DOCUMENT' | 'RCS';

export type FileUploadRequest = {
	file: string;
	type: FileType;
	name?: string;
	link?: string;
};

export type FileUploadResponse = {
	fileId: string;
	type: string;
	link: string | null | undefined;
};

type AuthInfo = {
	apiKey: string;
	apiSecret: string;
};

export type RequestConfig = {
	method: string;
	url: string;
};

export type DefaultAgentType = {
	sdkVersion: string;
	osPlatform: string;
};

export const defaultAgent: DefaultAgentType = {
	sdkVersion: 'nodejs/2.0.0',
	osPlatform: `${process.platform} | ${process.version}`
};

abstract class DefaultMessageRequest {
	allowDuplicates: boolean;
	appId: string | undefined;
	protected agent: DefaultAgentType;

	protected constructor() {
		this.agent = defaultAgent;
		this.allowDuplicates = false;
	}
}

export type SingleMessageSentResponse = {
	groupId: string;
	to: string;
	from: string;
	type: MessageType;
	statusMessage: string;
	country: string;
	messageId: string;
	statusCode: string;
	accountId: string;
};

export class SingleMessageSendingRequest extends DefaultMessageRequest {
	message: Message;

	constructor(message: Message, allowDuplicates?: boolean, appId?: string) {
		super();
		this.message = message;
		if (typeof allowDuplicates === 'boolean') {
			this.allowDuplicates = allowDuplicates;
		}
		if (appId) {
			this.appId = appId;
		}
	}
}

export type MessageType =
	| 'SMS'
	| 'LMS'
	| 'MMS'
	| 'ATA'
	| 'CTA'
	| 'CTI'
	| 'RCS_SMS'
	| 'RCS_LMS'
	| 'RCS_MMS'
	| 'RCS_TPL'
	| 'NSA';

export class Message {
	/**
	 * 수신번호
	 */
	to: string;

	/**
	 * 발신번호
	 */
	from: string;

	/**
	 * 메시지 내용
	 */
	text?: string;

	/**
	 * 메시지 생성일자
	 */
	dateCreated?: string;

	/**
	 * 메시지 수정일자
	 */
	dateUpdated?: string;

	/**
	 * 메시지의 그룹 ID
	 */
	groupId?: string;

	/**
	 * 해당 메시지의 ID
	 */
	messageId?: string;

	/**
	 * MMS 전용 스토리지(이미지) ID
	 */
	imageId?: string;

	/**
	 * @name MessageType 메시지 유형
	 */
	type?: MessageType;

	/**
	 * 문자 제목(LMS, MMS 전용)
	 */
	subject?: string;

	/**
	 * 메시지 타입 감지 여부(비활성화 시 반드시 타입이 명시 되어야 함)
	 */
	autoTypeDetect = true;

	/**
	 * 카카오 알림톡/친구톡을 위한 프로퍼티
	 */
	kakaoOptions?: KakaoOption;

	/**
	 * RCS 메시지를 위한 프로퍼티
	 */
	rcsOptions?: RcsOption;

	/**
	 * 해외 문자 발송을 위한 국가번호(예) "82", "1" 등)
	 */
	country? = '82';

	/**
	 * 메시지 로그
	 */
	log?: Array<object>;

	constructor(
		to: string,
		from: string,
		text: string,
		dateCreated: string,
		dateUpdated: string,
		groupId: string,
		messageId: string,
		imageId: string,
		type: MessageType,
		subject: string,
		autoTypeDetect: boolean,
		kakaoOptions: KakaoOption,
		rcsOptions: RcsOption,
		country: string
	) {
		this.to = to;
		this.from = from;
		this.text = text;
		this.dateCreated = dateCreated;
		this.dateUpdated = dateUpdated;
		this.groupId = groupId;
		this.messageId = messageId;
		this.imageId = imageId;
		this.type = type;
		this.subject = subject;
		this.autoTypeDetect = autoTypeDetect;
		this.kakaoOptions = kakaoOptions;
		this.rcsOptions = rcsOptions;
		this.country = country;
	}
}

export class KakaoOption {
	pfId: string;
	templateId?: string;
	variables?: Record<string, string>;
	disableSms = false;
	adFlag = false;
	buttons?: Array<KakaoButton>;
	imageId?: string;

	constructor(
		pfId: string,
		templateId: string,
		variables: Record<string, string>,
		disableSms: boolean,
		adFlag: boolean,
		buttons: Array<KakaoButton>,
		imageId: string
	) {
		this.pfId = pfId;
		this.templateId = templateId;
		this.variables = variables;
		this.disableSms = disableSms;
		this.adFlag = adFlag;
		this.buttons = buttons;
		this.imageId = imageId;
	}
}

type KakaoButtonType = 'WL' | 'AL' | 'BK' | 'MD' | 'DS' | 'BC' | 'BT' | 'AC';

export type KakaoButton = {
	buttonName: string;
	buttonType: KakaoButtonType;
	linkMo?: string;
	linkPc?: string;
	linkAnd?: string;
	linkIos?: string;
};

export type AdditionalBody = {
	title: string;
	description: string;
	imaggeId?: string;
	buttons?: Array<RcsButton>;
};

export type RcsOptionRequest = {
	brandId: string;
	templateId?: string;
	copyAllowed?: boolean;
	mmsType?: 'M3' | 'S3' | 'M4' | 'S4' | 'M5' | 'S5' | 'M6' | 'S6'; // (M: 중간 사이즈. S: 작은 사이즈. 숫자: 사진 개수)
	commercialType?: boolean;
	variables?: Record<string, string>;
	disableSms?: boolean;
	additionalBody?: AdditionalBody;
	buttons: Array<RcsButton>;
};

export class RcsOption {
	brandId: string;
	templateId?: string;
	copyAllowed?: boolean;
	mmsType?: 'M3' | 'S3' | 'M4' | 'S4' | 'M5' | 'S5' | 'M6' | 'S6'; // (M: 중간 사이즈. S: 작은 사이즈. 숫자: 사진 개수)
	commercialType?: boolean;
	variables?: Record<string, string>;
	disableSms?: boolean;
	additionalBody?: AdditionalBody;
	buttons: Array<RcsButton>;

	constructor(parameter: RcsOptionRequest) {
		this.brandId = parameter.brandId;
		this.templateId = parameter.templateId;
		this.copyAllowed = parameter.copyAllowed;
		this.mmsType = parameter.mmsType;
		this.commercialType = parameter.commercialType;
		this.variables = parameter.variables;
		this.disableSms = parameter.disableSms;
		this.additionalBody = parameter.additionalBody;
		this.buttons = parameter.buttons;
	}
}

export type RcsButtonType =
	| 'WL' // (웹링크)
	| 'ML' // (지도[좌표])
	| 'MQ' // (지도[쿼리])
	| 'MR' // (위치공유)
	| 'CA' // (캘린더생성)
	| 'CL' // (복사)
	| 'DL' // (전화걸기)
	| 'MS'; // (메시지보내기)

export type RcsWebButton = {
	buttonName: string;
	buttonType: Extract<RcsButtonType, 'WL'>;
	link: string;
};

export type RcsMapButton = {
	buttonName: string;
	buttonType: Extract<RcsButtonType, 'ML'>;
	latitude: string;
	longitude: string;
};

export type RcsDefaultButton = {
	buttonName: string;
	buttonType: Exclude<RcsButtonType, 'WL'>;
	link: string;
};

export type RcsButton = RcsWebButton | RcsMapButton | RcsDefaultButton;
