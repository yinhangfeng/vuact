import { defineComponent } from 'vue';
import { r2v } from 'vuact';
import RenderPropsComponent from './render-props';
const VRenderPropsComponent = r2v(RenderPropsComponent);
const VRenderPropsComponent2 = r2v(RenderPropsComponent, {
  slotsTransformConfig: {
    title: {
      elementProp: true,
    },
    default: {
      elementProp: false,
    },
  },
});

export default defineComponent({
  setup: () => {
    return () => {
      return [
        <VRenderPropsComponent>
          {{
            'element:title': () => <div>title</div>,
          }}
        </VRenderPropsComponent>,
        <VRenderPropsComponent2>
          {{
            title: () => <div>title</div>,
          }}
        </VRenderPropsComponent2>,
        <VRenderPropsComponent>
          {{
            renderTitle: (count) => <div>renderTitle {count}</div>,
          }}
        </VRenderPropsComponent>,
        <VRenderPropsComponent>
          <div>children</div>
        </VRenderPropsComponent>,
        <VRenderPropsComponent>
          {{ children: (count) => <div>children {count}</div> }}
        </VRenderPropsComponent>,
        <VRenderPropsComponent2>
          {(count) => <div>children {count}</div>}
        </VRenderPropsComponent2>,
      ];
    };
  },
});
