import create from "zustand";
import { ExampleItem, ExampleListRequest } from "@core/services/example/ExampleRepositoryInterface";
import { AXFDGDataItem, AXFDGPage, AXFDGSortParam } from "@axframe/datagrid";
import { ExampleService } from "services";
import { errorDialog } from "@core/components/dialogs/errorDialog";
import { setMetaDataByPath } from "@core/stores/usePageTabStore";
import { subscribeWithSelector } from "zustand/middleware";
import shallow from "zustand/shallow";
import { PageStoreActions, StoreActions } from "@core/stores/types";
import { pageStoreActions } from "@core/stores/pageStoreActions";
import { ROUTES } from "router/Routes";
import { pick } from "lodash";

interface ListRequest extends ExampleListRequest {}

interface MetaData {
  listRequestValue: ListRequest;
  listColWidths: number[];
  listSortParams: AXFDGSortParam[];
}

interface States extends MetaData {
  routePath: string; // initialized Store;
  listSpinning: boolean;
  listData: AXFDGDataItem<ExampleItem>[];
  listPage: AXFDGPage;
}

interface Actions extends PageStoreActions<States> {
  setListRequestValue: (requestValue: ListRequest) => void;
  setListColWidths: (colWidths: number[]) => void;
  setListSpinning: (spinning: boolean) => void;
  setListSortParams: (sortParams: AXFDGSortParam[]) => void;
  callListApi: (request?: ListRequest) => Promise<void>;
  changeListPage: (currentPage: number, pageSize?: number) => Promise<void>;
}

// create states
const createState: States = {
  routePath: ROUTES.EXAMPLES.children.LIST_DETAIL.children.LIST.path,
  listRequestValue: {
    pageNumber: 1,
    pageSize: 100,
  },
  listColWidths: [],
  listSpinning: false,
  listData: [],
  listPage: {
    currentPage: 0,
    totalPages: 0,
  },
  listSortParams: [],
};

// create actions
const createActions: StoreActions<States & Actions, Actions> = (set, get) => ({
  setListRequestValue: (requestValues) => {
    set({ listRequestValue: requestValues });
  },
  setListColWidths: (colWidths) => set({ listColWidths: colWidths }),
  setListSpinning: (spinning) => set({ listSpinning: spinning }),
  setListSortParams: (sortParams) => set({ listSortParams: sortParams }),
  callListApi: async (request) => {
    await set({ listSpinning: true });

    try {
      const apiParam = request ?? get().listRequestValue;
      const response = await ExampleService.list(apiParam);

      set({
        listData: response.ds.map((values) => ({
          values,
        })),
        listPage: {
          currentPage: response.rs.pageNumber ?? 1,
          pageSize: response.rs.pageSize ?? 0,
          totalPages: response.rs.pgCount ?? 0,
          totalElements: response.ds.length,
        },
      });
    } catch (e) {
      await errorDialog(e as any);
    } finally {
      await set({ listSpinning: false });
    }
  },
  changeListPage: async (pageNumber, pageSize) => {
    const requestValues = {
      ...get().listRequestValue,
      pageNumber,
      pageSize,
    };
    set({ listRequestValue: requestValues });
    await get().callListApi();
  },
  syncMetadata: (metaData) => {
    if (metaData) {
      console.log(`apply metaData Store : useExampleListStore`);
      set({
        listSortParams: metaData.listSortParams,
        listRequestValue: metaData.listRequestValue,
        listColWidths: metaData.listColWidths,
      });
    } else {
      console.log(`clear metaData Store : useExampleListStore`);
      const metaDataKeys: (keyof MetaData)[] = ["listSortParams", "listRequestValue", "listColWidths"];
      set(pick(createState, metaDataKeys));
    }
  },
  ...pageStoreActions(set, get, () => unSubscribeExampleListStore()),
});

// ---------------- exports
export interface ExampleListStore extends States, Actions, PageStoreActions<States> {}
export const useExampleListStore = create(
  subscribeWithSelector<ExampleListStore>((set, get) => ({
    ...createState,
    ...createActions(set, get),
  }))
);

// pageModel 에 저장할 대상 모델 셀렉터 정의
export const unSubscribeExampleListStore = useExampleListStore.subscribe(
  (s) => [s.listSortParams, s.listRequestValue, s.listColWidths],
  ([listSortParams, listRequestValue, listColWidths]) => {
    console.log(`Save metaData '${createState.routePath}', Store : useExampleListStore`);

    setMetaDataByPath<MetaData>(createState.routePath, {
      listSortParams,
      listRequestValue,
      listColWidths,
    });
  },
  { equalityFn: shallow }
);
