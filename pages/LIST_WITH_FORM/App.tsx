import * as React from "react";
import styled from "@emotion/styled";
import { ColResizer, ProgramTitle } from "@core/components/common";
import { AXFIRevert } from "@axframe/icon";
import { Button, Form } from "antd";
import { PageLayout } from "styles/pageStyled";
import { useDidMountEffect, useI18n } from "@core/hooks";
import { use$LIST_WITH_FORM$Store } from "./use$LIST_WITH_FORM$Store";
import { FormSet } from "./FormSet";
import { IParam, SearchParams, SearchParamType } from "@core/components/search";
import { AXFDGClickParams } from "@axframe/datagrid";
import { ExampleItem } from "@core/services/example/ExampleRepositoryInterface";
import { ListDataGrid } from "./ListDataGrid";

interface DtoItem extends ExampleItem {}

interface Props {}

function App({}: Props) {
  const { t } = useI18n();

  const init = use$LIST_WITH_FORM$Store((s) => s.init);
  const reset = use$LIST_WITH_FORM$Store((s) => s.reset);
  const callListApi = use$LIST_WITH_FORM$Store((s) => s.callListApi);
  const setFlexGrow = use$LIST_WITH_FORM$Store((s) => s.setFlexGrow);
  const listRequestValue = use$LIST_WITH_FORM$Store((s) => s.listRequestValue);
  const setListRequestValue = use$LIST_WITH_FORM$Store((s) => s.setListRequestValue);
  const listSpinning = use$LIST_WITH_FORM$Store((s) => s.listSpinning);
  const setListSelectedRowKey = use$LIST_WITH_FORM$Store((s) => s.setListSelectedRowKey);
  const flexGrow = use$LIST_WITH_FORM$Store((s) => s.flexGrow);
  const cancelFormActive = use$LIST_WITH_FORM$Store((s) => s.cancelFormActive);
  const setFormActive = use$LIST_WITH_FORM$Store((s) => s.setFormActive);

  const resizerContainerRef = React.useRef<HTMLDivElement>(null);
  const [searchForm] = Form.useForm();

  const handleSearch = React.useCallback(async () => {
    await callListApi();
  }, [callListApi]);

  const onClickItem = React.useCallback(
    (params: AXFDGClickParams<DtoItem>) => {
      setListSelectedRowKey(params.item.id, params.item);
    },
    [setListSelectedRowKey]
  );

  const params = React.useMemo(
    () =>
      [
        {
          placeholder: t.formItem.example.area.label,
          name: "select1",
          type: SearchParamType.SELECT,
          options: t.formItem.example.area.options,
        },
        {
          placeholder: t.formItem.example.cnsltHow.label,
          name: "select2",
          type: SearchParamType.SELECT,
          options: t.formItem.example.cnsltHow.options,
        },
        {
          placeholder: t.formItem.example.cnsltDt.label,
          name: "timeRange",
          type: SearchParamType.TIME_RANGE,
        },
      ] as IParam[],
    [t]
  );

  const handleReset = React.useCallback(async () => {
    reset();
    await callListApi();
  }, [callListApi, reset]);

  useDidMountEffect(() => {
    init();
    callListApi();
  });

  return (
    <Container stretch role={"page-container"}>
      <Header>
        <ProgramTitle title={t.pages.example.listWithForm.title}>
          <Button icon={<AXFIRevert />} onClick={handleReset} size='small' type={"ghost"}>
            {t.button.reset}
          </Button>
        </ProgramTitle>

        <ButtonGroup compact>
          <Button
            onClick={() => {
              callListApi();
            }}
          >
            {t.button.search}
          </Button>
          <Button
            type={"primary"}
            onClick={() => {
              cancelFormActive();
              setFormActive();
            }}
          >
            {t.button.addNew}
          </Button>
        </ButtonGroup>
      </Header>

      <PageSearchBar>
        <SearchParams
          form={searchForm}
          params={params}
          paramsValue={listRequestValue}
          onChangeParamsValue={(value) => setListRequestValue(value)}
          onSearch={handleSearch}
          spinning={listSpinning}
        />
      </PageSearchBar>

      <Body ref={resizerContainerRef}>
        <Frame style={{ flex: flexGrow }}>
          <ListDataGrid onClick={onClickItem} />
        </Frame>
        <ColResizer containerRef={resizerContainerRef} onResize={(flexGlow) => setFlexGrow(flexGlow)} />
        <FormSet />
      </Body>
    </Container>
  );
}

const Container = styled(PageLayout)``;
const Header = styled(PageLayout.Header)``;
const PageSearchBar = styled(PageLayout.PageSearchBar)``;
const Body = styled(PageLayout.FrameRow)`
  padding: 0;
`;
const ButtonGroup = styled(PageLayout.ButtonGroup)``;
const Frame = styled(PageLayout.FrameColumn)`
  padding: 0 15px 30px 30px;
`;

export default App;
