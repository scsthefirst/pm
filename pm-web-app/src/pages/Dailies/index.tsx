import React from 'react';
import { Button, DatePicker, Input } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import * as R from 'ramda';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import { ProjDaily, client } from '@/apollo';
import ProjItem from './ProjItem';
import ProjPie from './ProjPie';
import StripPercentage from './StripPercentage';
import { useDailiesStatus } from './hook';

const dateFormat = 'YYYYMMDD';

function Dailies(prop: { date?: string }) {
  const hookStatus = useDailiesStatus(prop.date);

  const onHoursChange = (i: number) => (h: number) => {
    hookStatus.setCurrentDaily(
      R.over(
        R.lensPath(['projs', i]),
        (pd: ProjDaily) => ({ ...pd, timeConsuming: h }),
        hookStatus.currentDaily,
      ),
    );
  };
  const onContentOfWorkChange = (i: number) => (c: string) =>
    hookStatus.setCurrentDaily(
      R.over(
        R.lensPath(['projs', i]),
        (pd: ProjDaily) => ({ ...pd, content: c }),
        hookStatus.currentDaily,
      ),
    );

  const list = () =>
    hookStatus.currentDaily?.projs?.map((d, i) => (
      <ProjItem
        key={d.projId}
        projId={d.projId}
        hours={d.timeConsuming}
        content={d.content}
        projName={hookStatus.getProjName(d.projId)}
        onHoursChange={onHoursChange(i)}
        onContentOfWorkChange={onContentOfWorkChange(i)}
        ref={hookStatus.refs[i]}
        visibleFilter={hookStatus.filter}
      />
    ));

  const handleLastReportOfDay = () => {
    const c = hookStatus.getLastDaily(hookStatus.currentDate);
    hookStatus.setCurrentDaily(c);
  };

  return (
    <PageContainer
      loading={hookStatus.projs.length === 0}
      extra={[
        <DatePicker
          key="date"
          value={moment(hookStatus.currentDate, dateFormat)}
          onChange={(d) => d && hookStatus.setCurrentDate(d.format(dateFormat))}
          dateRender={(current) => {
            const style: React.CSSProperties = {};
            if (hookStatus.completedDailiesDates!.includes(current.format(dateFormat))) {
              style.border = '1px solid #1890ff';
              style.borderRadius = '50%';
            }
            return (
              <div className="ant-picker-cell-inner" style={style}>
                {current.date()}
              </div>
            );
          }}
        />,
        <Input
          key="search"
          style={{ width: 200 }}
          addonBefore="检索"
          allowClear
          onChange={(e) => hookStatus.setFilter(e.target.value)}
        />,
      ]}
      content={
        <div style={{ marginLeft: -24, marginRight: -24, marginBottom: -16 }}>
          <StripPercentage
            data={hookStatus.currentDaily.projs}
            gotoAnchor={(i) => hookStatus.refs[i].current!.gotoAnchor(hookStatus.getOffset())}
          />
        </div>
      }
      footer={[
        <Button key="getLastHandle" onClick={handleLastReportOfDay}>
          加载上次日报
        </Button>,
        <Button
          key="submit"
          onClick={() =>
            hookStatus.pushDaily({
              variables: {
                date: hookStatus.currentDate,
                projDailies: hookStatus.currentDaily.projs.filter((p) => p.timeConsuming !== 0),
              },
            })
          }
          disabled={!R.any((e) => e.timeConsuming !== 0, hookStatus.currentDaily.projs)}
          loading={hookStatus.loading}
        >
          {hookStatus.isNew ? '创建' : '更新'}
        </Button>,
      ]}
      fixedHeader
    >
      {list()}
      <ProjPie
        data={hookStatus.currentDaily.projs.map((p) => ({
          ...p,
          projName: hookStatus.getProjName(p.projId),
        }))}
      />
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Dailies />
  </ApolloProvider>
);
