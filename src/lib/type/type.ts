// src/stores/profileStore.ts
import { writable } from 'svelte/store';

interface Profile {
	id: string;
	user_id: string;
	point: number;
	level: number;
	barcode: string;
	email: string | null;
	class: string;
}

export type Product = {
	id: number;
	name: string;
	imgURL: string;
	description: string;
	published: boolean;
	amount: number;
	price: number;
	where_to_use: string;
	createdAt: string;
	updatedAt: String;
};

export type Card = {
	id: string;
	title: string;
	imgURL: string;
	style: string;
	url: string;
	createdAt: string;
	updatedAt: string;
	description: String;
};

const initialState = {
	'101': 0,
	'102': 0,
	'103': 0,
	'104': 0,
	'105': 0,
	'106': 0,
	'201': 0,
	'202': 0,
	'203': 0,
	'204': 0,
	'205': 0,
	'206': 0,
	'301': 0,
	'302': 0,
	'303': 0,
	'304': 0,
	'305': 0,
	'306': 0
};

// writable 스토어 생성
export const resultStore = writable(initialState);

// 초기 프로파일 객체
const initialProfile: Profile = {
	id: '',
	user_id: '',
	point: 0,
	level: 0,
	barcode: '',
	email: null
};

// profile 스토어 생성
export const profileStore = writable<Profile>(initialProfile);
