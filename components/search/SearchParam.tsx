import * as React from "react";
import { SearchParamSelect } from "./SearchParamSelect";
import { SearchParamTimeRange } from "./SearchParamTimeRange";

export enum SearchParamType {
  TIME_RANGE,
  SELECT,
}

export interface SearchParamOption {
  value: string;
  label: React.ReactNode;
}

interface Props {
  name: string;
  title: React.ReactNode;
  type: SearchParamType;
  value: any;
  options?: SearchParamOption[];
  onClickExtraButton?: (params: Record<string, any>) => void;
}

export type SearchParamComponentProp<R> = {
  [key in SearchParamType]: R;
};

export type SearchParamComponent = React.FC<Props>;

const SearchParamComponents: SearchParamComponentProp<SearchParamComponent> = {
  [SearchParamType.TIME_RANGE]: SearchParamTimeRange,
  [SearchParamType.SELECT]: SearchParamSelect,
};

const SearchParam: SearchParamComponent = (props) => {
  const Comp = SearchParamComponents[props.type];
  return <Comp {...props} />;
};

export { SearchParam };
