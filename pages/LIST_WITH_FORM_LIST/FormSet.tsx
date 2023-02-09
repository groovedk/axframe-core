import * as React from "react";
import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import styled from "@emotion/styled";
import { PageLayout } from "styles/pageStyled";
import { ExampleItem } from "@core/services/example/ExampleRepositoryInterface";
import { useI18n } from "@core/hooks";
import { use$LIST_WITH_FORM_LIST$Store } from "./use$LIST_WITH_FORM_LIST$Store";
import { EmptyMsg } from "@core/components/common";
import { convertToDate } from "../../utils/object";
import { SubListDataGrid } from "./SubListDataGrid";

interface Props {}
interface DtoItem extends ExampleItem {}

function FormSet({}: Props) {
  const saveRequestValue = use$LIST_WITH_FORM_LIST$Store((s) => s.saveRequestValue);
  const setSaveRequestValue = use$LIST_WITH_FORM_LIST$Store((s) => s.setSaveRequestValue);
  const callSaveApi = use$LIST_WITH_FORM_LIST$Store((s) => s.callSaveApi);
  const saveSpinning = use$LIST_WITH_FORM_LIST$Store((s) => s.saveSpinning);
  const flexGrow = use$LIST_WITH_FORM_LIST$Store((s) => s.flexGrow);
  const listSelectedRowKey = use$LIST_WITH_FORM_LIST$Store((s) => s.listSelectedRowKey);
  const formActive = use$LIST_WITH_FORM_LIST$Store((s) => s.formActive);
  const cancelFormActive = use$LIST_WITH_FORM_LIST$Store((s) => s.cancelFormActive);
  const setFormActive = use$LIST_WITH_FORM_LIST$Store((s) => s.setFormActive);

  const { t } = useI18n();
  const [form] = Form.useForm();

  const formInitialValues = {}; // form 의 초기값 reset해도 이값 으로 리셋됨

  const onValuesChange = React.useCallback(
    (changedValues: any, values: Record<string, any>) => {
      // if ("birthDt" in changedValues) {
      //   values["age"] = dayjs().diff(dayjs(changedValues.birthDt), "years");
      // }
      setSaveRequestValue(values);
    },
    [setSaveRequestValue]
  );

  React.useEffect(() => {
    if (!saveRequestValue || Object.keys(saveRequestValue).length < 1) {
      form.resetFields();
    } else {
      form.setFieldsValue(convertToDate({ ...saveRequestValue }, ["cnsltDt"]));
    }
  }, [saveRequestValue, form]);

  if (!formActive && !listSelectedRowKey) {
    return (
      <Frame style={{ flex: 2 - flexGrow }}>
        <EmptyMsg>
          <Button
            size='small'
            onClick={() => {
              cancelFormActive();
              setFormActive();
            }}
          >
            {t.button.addNew}
          </Button>
        </EmptyMsg>
        <Form form={form} />
      </Frame>
    );
  }

  return (
    <Frame style={{ flex: 2 - flexGrow }}>
      <Header>Form</Header>
      <Body>
        <Form<DtoItem>
          form={form}
          layout={"vertical"}
          colon={false}
          scrollToFirstError
          initialValues={formInitialValues}
          onValuesChange={onValuesChange}
          onFinish={async () => {
            await callSaveApi();
            await cancelFormActive();
          }}
        >
          <FormBox>
            <Row gutter={[20, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item label={"ID"} name={"id"} rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[20, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={t.formItem.example.area.label}
                  name={"area"}
                  rules={[{ required: true, message: "커스텀 메세지 사용 가능" }]}
                >
                  <Select options={t.formItem.example.area.options} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item label={t.formItem.example.cnsltDt.label} name={"cnsltDt"}>
                  <DatePicker />
                </Form.Item>
              </Col>
            </Row>
          </FormBox>

          <SubListDataGrid />

          <ButtonGroup>
            <Button type={"primary"} htmlType={"submit"} loading={saveSpinning}>
              저장하기
            </Button>
            <Button onClick={() => cancelFormActive()}>{t.button.cancel}</Button>
          </ButtonGroup>
        </Form>
      </Body>
    </Frame>
  );
}

const Frame = styled(PageLayout.FrameColumn)`
  padding: 0 30px 30px 15px;
`;
const Header = styled(PageLayout.FrameHeader)``;
const Body = styled.div``;

const FormBox = styled(PageLayout.ContentBox)`
  > * {
    max-width: 960px;
  }
`;
const ButtonGroup = styled(PageLayout.ButtonGroup)``;

export { FormSet };