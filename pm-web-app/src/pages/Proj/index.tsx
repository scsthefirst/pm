import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';
import { Table } from 'antd';
import { client, Project as Proj } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import { getStageDisplayName, projStage } from './utils';

function getColumns(showModal: (proj: Proj) => void) {
  return [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Proj) => <a onClick={() => showModal(record)}>{text}</a>,
      width: '50%',
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => {
        return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: '120px',
      render: (stage: string) => getStageDisplayName(stage),
      filters: projStage.map((s) => ({ text: s[1], value: s[0] })),
      onFilter: (value: string | number | boolean, record: Proj) => record.stage === value,
    },
  ];
}
function Project() {
  const {
    projs,
    loading,
    currentProj,
    visible,
    showModal,
    closeModal,
    submitProj,
  } = useProjStatus();
  const columns = getColumns((proj) => {
    showModal(proj);
  });
  return (
    <PageContainer loading={loading}>
      <Table rowKey={(record) => record.id} columns={columns} dataSource={projs} />
      <ProjForm visible={visible} onCancel={closeModal} onSubmit={submitProj} proj={currentProj} />
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
