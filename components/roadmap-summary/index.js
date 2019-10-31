import Link from 'next/link';
import classNames from 'classnames';

import {
  SummaryContainer,
  Title,
  Description,
  Image,
  Header,
  Summary,
  VersionLink,
  VersionList,
} from './style';

const RoadmapSummary = ({ roadmap }) => (
  <SummaryContainer>
    <Header>
      <Title>{ roadmap.title }</Title>
      <Description>{ roadmap.description }</Description>
      <VersionList className="border-bottom">
        { (roadmap.versions || []).map(versionItem => (
          <Link href={ `${roadmap.slug}/${versionItem}` } passHref key={ versionItem }>
            <VersionLink className={ classNames({
              active: versionItem === roadmap.version,
            }) }>{ versionItem } Version</VersionLink>
          </Link>
        )) }
      </VersionList>
    </Header>
    <Summary className="border-bottom">
      <div className="container">
        <Image src={ roadmap.picture } />
      </div>
    </Summary>
  </SummaryContainer>
);

export default RoadmapSummary;