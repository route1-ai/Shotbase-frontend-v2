import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { WebGLShader } from './web-gl-shader';

vi.mock('three', () => {
  class MockScene { add() {} remove() {} }
  class MockWebGLRenderer {
    setPixelRatio() {}
    setClearColor() {}
    setSize() {}
    render() {}
    dispose() {}
  }
  class MockOrthographicCamera {
    position = { setZ: () => {} };
  }
  class MockBufferGeometry {
    setAttribute() {}
    dispose() {}
  }
  class MockBufferAttribute {}
  class MockRawShaderMaterial {
    uniforms = { time: { value: 0 }, resolution: { value: {} } };
    dispose() {}
  }
  class MockShaderMaterial {
    uniforms = { time: { value: 0 }, resolution: { value: {} } };
    dispose() {}
  }
  class MockMesh {
    geometry = new MockBufferGeometry();
    material = new MockShaderMaterial();
  }
  class MockColor {}
  class MockVector2 {}

  return {
    __esModule: true,
    default: {
      Scene: MockScene,
      WebGLRenderer: MockWebGLRenderer,
      Color: MockColor,
      OrthographicCamera: MockOrthographicCamera,
      BufferGeometry: MockBufferGeometry,
      BufferAttribute: MockBufferAttribute,
      ShaderMaterial: MockShaderMaterial,
      RawShaderMaterial: MockRawShaderMaterial,
      Mesh: MockMesh,
      Vector2: MockVector2,
      DoubleSide: 2,
    },
    Scene: MockScene,
    WebGLRenderer: MockWebGLRenderer,
    Color: MockColor,
    OrthographicCamera: MockOrthographicCamera,
    BufferGeometry: MockBufferGeometry,
    BufferAttribute: MockBufferAttribute,
    ShaderMaterial: MockShaderMaterial,
    RawShaderMaterial: MockRawShaderMaterial,
    Mesh: MockMesh,
    Vector2: MockVector2,
    DoubleSide: 2,
    Material: class MockMaterial {},
  };
});

describe('WebGLShader', () => {
  it('renders correctly', () => {
    const { container, unmount } = render(<WebGLShader />);
    expect(container.firstChild).toBeInTheDocument();
    unmount(); // explicitly unmount to run cleanup
  });
});
