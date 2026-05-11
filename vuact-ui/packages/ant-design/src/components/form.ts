import { Form as RForm, Form } from 'antd';
import { r2v } from 'vuact';

export const FormItem = r2v(RForm.Item);
export const FormList = r2v(RForm.List);
export const FormProvider = r2v(RForm.Provider);

const RawForm = r2v(RForm);
export const Form = Object.assign(RawForm, {
  Item: FormItem,
  List: FormList,
  Provider: FormProvider,
});

export const FormInstance = Form;

export default Form;
