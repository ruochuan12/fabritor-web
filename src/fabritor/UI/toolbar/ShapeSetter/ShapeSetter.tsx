import { useContext, useEffect } from 'react';
import { Form, InputNumber, Switch } from 'antd';
import { GloablStateContext } from '@/context';
import { getGlobalEditor } from '@/utils/global';
import ColorSetter from '@/fabritor/components/ColorSetter';
import BorderSetter from '../ImageSetter/BorderSetter';
import OpacitySetter from '@/fabritor/components/OpacitySetter';

const { Item: FormItem } = Form;

const getObjectBorderType = (stroke, strokeWidth, strokeDashArray) => {
  if (!stroke) {
    return 'none';
  }
  if (strokeDashArray?.length) {
    let [d1, d2] = strokeDashArray;
    d1 = d1 / (strokeWidth / 2 > 1 ? strokeWidth / 2 : strokeWidth);
    d2 = d2 / (strokeWidth / 4 > 1 ? strokeWidth / 4 : strokeWidth);
    return [d1, d2].join(',');
  }
  return 'line';
}

export default function ShapeSetter () {
  const { object } = useContext(GloablStateContext);
  const [form] = Form.useForm();

  const handleBorder = (border) => {
    const editor = getGlobalEditor();
    const { type, stroke = '#000', strokeWidth, borderRadius } = border || {};
    if (type === 'none') {
      object.set('stroke', null);
    } else {
      object.set('stroke', stroke);
      object.set('strokeWidth', strokeWidth);
  
      if (type !== 'line') {
        const dashArray = type.split(',');
        dashArray[0] = dashArray[0] * (strokeWidth / 2 > 1 ? strokeWidth / 2 : strokeWidth);
        dashArray[1] = dashArray[1] * (strokeWidth / 4 > 1 ? strokeWidth / 4 : strokeWidth);
        object.set('strokeDashArray', dashArray);
      } else {
        object.set('strokeDashArray', null);
      }
    }

    object.set('rx', borderRadius);
    object.set('ry', borderRadius);

    editor.canvas.requestRenderAll();
  }

  const handleValuesChange = (values) => {
    const editor = getGlobalEditor();
    if (values.fill) {
      object.set('fill', values.fill);
      editor.canvas.requestRenderAll();
    }
    if (values.border) {
      handleBorder(values.border);
    }
    if (values.opacity != null) {
      object.set('opacity', values.opacity);
      editor.canvas.requestRenderAll();
    }
  }


  useEffect(() => {
    if (object) {
      form.setFieldsValue({
        border: {
          type: getObjectBorderType(object.stroke, object.strokeWidth, object.strokeDashArray),
          stroke: object.stroke || '#000000',
          strokeWidth: object.strokeWidth || 1,
          borderRadius: object.rx || object.ry
        },
        fill: object.fill,
        opacity: object.opacity
      });
    }
  }, [object]);

  return (
    <Form
      form={form}
      onValuesChange={handleValuesChange}
      layout="inline"
    >
      <FormItem name="fill">
        <ColorSetter />
      </FormItem>
      <FormItem name="border">
        <BorderSetter />
      </FormItem>
      <FormItem name="opacity">
        <OpacitySetter />
      </FormItem>
    </Form>
  )
}