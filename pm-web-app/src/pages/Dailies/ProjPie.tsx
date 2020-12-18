import { Pie } from '@ant-design/charts';
import { Card } from 'antd';
import React from 'react';
import { ProjectReportData } from './def';

interface ProjPieProps {
  data: ProjectReportData[];
}

export default (props: ProjPieProps) => {
  const data = props.data
    .filter((p) => p.hours !== 0)
    .map((p) => ({ type: p.name, value: p.hours }));

  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  return (
    <Card>
      <Pie {...config} />
    </Card>
  );
};