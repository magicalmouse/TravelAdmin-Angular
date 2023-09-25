export class ApiResponse {
	errorMessage: string;
	statusCode: number;
	body: string;
	isBase64Encoded: boolean;
}

export class Account {
	custId: string = '';
	fleetId: string = '';
	name: string = '';

	constructor(custId: string, fleetId: string, name: string) {
		this.custId = custId;
		this.fleetId = fleetId;
		this.name = name;
	}

	get key(): string {
		return this.custId + ':' + this.fleetId;
	}
}
