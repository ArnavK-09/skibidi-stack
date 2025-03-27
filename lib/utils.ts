import { depVersions } from "../consts";

export const getDepVersion = (depName: string) => {
	return depVersions[depName] || "latest";
};
